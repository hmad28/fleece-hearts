import type { CreateOrderInput, ID, Order, OrderItem, OrderLookupInput, PaymentProvider, ShippingProvider } from "@fh/types";
import type { OrderService } from "../contracts";
import type { MockCatalogService } from "./catalog";
import { delay, mockId } from "./delay";

/**
 * Simulasi order. Di backend asli, createOrder berjalan dalam SATU transaksi DB:
 * validasi harga → reservasi stok (TTL) → buat order → buat payment (blueprint §41–42).
 * Harga SELALU dihitung ulang dari katalog, bukan dari client.
 */
export class MockOrderService implements OrderService {
  private readonly orders = new Map<ID, Order>();
  private seq = 0;

  constructor(
    private readonly catalog: MockCatalogService,
    private readonly payment: PaymentProvider,
    private readonly shipping: ShippingProvider,
  ) {}

  private nextOrderNumber(now: Date): string {
    this.seq += 1;
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    return `FH-${ym}-${String(this.seq).padStart(4, "0")}`;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    await delay(500);
    const all = (await this.catalog.listProducts({ perPage: 1000 })).items;

    const items: OrderItem[] = input.items.map((line) => {
      const product = all.find((p) => p.variants.some((v) => v.id === line.variantId));
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (!product || !variant) throw new Error(`Varian tidak ditemukan: ${line.variantId}`);
      if (variant.available < line.quantity) throw new Error(`Stok ${product.name} ${variant.size} tidak cukup`);
      const unitPrice = variant.price ?? product.price;
      return {
        id: mockId("oi"),
        productId: product.id,
        variantId: variant.id,
        productName: product.colorway ? `${product.name} – ${product.colorway}` : product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        imageUrl: product.images[0]?.url ?? null,
        unitPrice,
        quantity: line.quantity,
        lineTotal: unitPrice * line.quantity,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const weightGram = items.reduce((s, i) => {
      const p = all.find((x) => x.id === i.productId);
      return s + (p?.weightGram ?? 0) * i.quantity;
    }, 0);

    const rates = await this.shipping.getRates({
      destination: {
        postalCode: input.shippingAddress.postalCode,
        city: input.shippingAddress.city,
        district: input.shippingAddress.district,
      },
      weightGram,
      itemValue: subtotal,
    });
    const rate = rates.find((r) => r.courierCode === input.courierCode && r.service === input.courierService);
    if (!rate) throw new Error("Layanan kurir tidak tersedia");

    const now = new Date();
    const id = mockId("ord");
    const orderNumber = this.nextOrderNumber(now);
    const total = subtotal + rate.price;

    const payment = await this.payment.createPayment({
      orderId: id,
      orderNumber,
      amount: total,
      methodCode: input.paymentMethodCode,
      customer: input.customer,
    });

    const order: Order = {
      id,
      orderNumber,
      status: "PENDING",
      paymentStatus: payment.status,
      shipmentStatus: "PENDING",
      customer: input.customer,
      shippingAddress: input.shippingAddress,
      items,
      subtotal,
      shippingFee: rate.price,
      discount: 0,
      total,
      paymentId: payment.id,
      paymentMethodCode: input.paymentMethodCode,
      courierCode: rate.courierCode,
      courierService: rate.service,
      createdAt: now.toISOString(),
      timeline: [{ at: now.toISOString(), type: "ORDER", status: "PENDING", note: "Order dibuat" }],
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: ID): Promise<Order | null> {
    await delay(200);
    const order = this.orders.get(id);
    return order ? this.syncPayment(order) : null;
  }

  async lookupOrder({ orderNumber, contact }: OrderLookupInput): Promise<Order | null> {
    await delay(300);
    const needle = contact.trim().toLowerCase();
    const order = [...this.orders.values()].find(
      (o) =>
        o.orderNumber === orderNumber.trim().toUpperCase() &&
        (o.customer.email.toLowerCase() === needle || o.customer.phone.replace(/\D/g, "") === needle.replace(/\D/g, "")),
    );
    return order ? this.syncPayment(order) : null;
  }

  /** Simulasi efek webhook: payment PAID → order CONFIRMED. */
  private async syncPayment(order: Order): Promise<Order> {
    if (!order.paymentId || order.paymentStatus !== "PENDING") return order;
    const payment = await this.payment.getPaymentStatus(order.paymentId);
    if (payment.status === order.paymentStatus) return order;

    const at = new Date().toISOString();
    const next: Order = {
      ...order,
      paymentStatus: payment.status,
      status: payment.status === "PAID" ? "CONFIRMED" : "CANCELLED",
      timeline: [...order.timeline, { at, type: "PAYMENT", status: payment.status }],
    };
    this.orders.set(order.id, next);
    return next;
  }
}
