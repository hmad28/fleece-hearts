import type { CreateOrderInput, ID, Order, OrderItem, OrderLookupInput, PaymentProvider, ShippingProvider } from "@fh/types";
import { checkoutSchema } from "@fh/validation";
import type { OrderService } from "../contracts";
import type { MockCatalogService } from "./catalog";
import type { MockDropService } from "./drops";
import { delay, mockId } from "./delay";

const STORAGE_KEY = "fh-demo-orders-v1";

/**
 * Simulasi order. Di backend asli, createOrder berjalan dalam SATU transaksi DB:
 * validasi harga → reservasi stok (TTL) → buat order → buat payment (blueprint §41–42).
 * Harga SELALU dihitung ulang dari katalog, bukan dari client.
 */
export class MockOrderService implements OrderService {
  constructor(
    private readonly catalog: MockCatalogService,
    private readonly payment: PaymentProvider,
    private readonly shipping: ShippingProvider,
    private readonly drops: MockDropService,
  ) {}

  private readAll(): Record<ID, Order> {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
  }

  private async save(order: Order) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.readAll(), [order.id]: order }));
    // Akun masuk mendapat riwayat order demo lintas browser untuk customer/admin.
    try { await fetch("/api/demo-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) }); } catch { /* Guest checkout and offline demo remain local. */ }
  }

  private nextOrderNumber(now: Date): string {
    const ym = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    return `FH-${ym}-${now.getTime().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    await delay(500);
    checkoutSchema.parse(input);
    const all = (await this.catalog.listProducts({ perPage: 1000 })).items;
    const { drops } = await this.drops.listDrops();
    const requested = new Map<ID, number>();
    for (const line of input.items) requested.set(line.variantId, (requested.get(line.variantId) ?? 0) + line.quantity);

    const items: OrderItem[] = input.items.map((line) => {
      const product = all.find((p) => p.variants.some((v) => v.id === line.variantId));
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (!product || !variant) throw new Error(`Varian tidak ditemukan: ${line.variantId}`);
      if (variant.status !== "ACTIVE" || variant.available < (requested.get(line.variantId) ?? 0)) throw new Error(`Stok ${product.name} ${variant.size} tidak cukup`);
      const drop = drops.find((d) => d.productIds.includes(product.id));
      if (drop && drop.status !== "LIVE") throw new Error(`${product.name} hanya bisa dibeli saat drop berlangsung`);
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
    const method = (await this.payment.listMethods()).find((item) => item.code === input.paymentMethodCode);
    if (!method) throw new Error("Metode pembayaran tidak tersedia");
    const total = subtotal + rate.price + method.fee;

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
      paymentFee: method.fee,
      discount: 0,
      total,
      paymentId: payment.id,
      paymentMethodCode: input.paymentMethodCode,
      courierCode: rate.courierCode,
      courierService: rate.service,
      createdAt: now.toISOString(),
      timeline: [{ at: now.toISOString(), type: "ORDER", status: "PENDING", note: "Order dibuat" }],
    };
    await this.save(order);
    return order;
  }

  async getOrder(id: ID): Promise<Order | null> {
    await delay(200);
    const order = this.readAll()[id];
    return order ? this.syncPayment(order) : null;
  }

  async lookupOrder({ orderNumber, contact }: OrderLookupInput): Promise<Order | null> {
    await delay(300);
    const needle = contact.trim().toLowerCase();
    const order = Object.values(this.readAll()).find(
      (o) =>
        o.orderNumber === orderNumber.trim().toUpperCase() &&
        (o.customer.email.toLowerCase() === needle || o.customer.phone.replace(/\D/g, "") === needle.replace(/\D/g, "")),
    );
    return order ? this.syncPayment(order) : null;
  }

  /** Simulasi efek webhook: payment PAID → order CONFIRMED. */
  private async syncPayment(order: Order): Promise<Order> {
    if (!order.paymentId) return order;
    const payment = await this.payment.getPaymentStatus(order.paymentId);
    let next = order;
    if (payment.status !== order.paymentStatus) {
      next = {
        ...order,
        paymentStatus: payment.status,
        status: payment.status === "PAID" ? "CONFIRMED" : "CANCELLED",
        timeline: [...order.timeline, { at: payment.paidAt ?? new Date().toISOString(), type: "PAYMENT", status: payment.status }],
      };
    }

    if (payment.status === "PAID" && payment.paidAt) {
      const paid = new Date(payment.paidAt).getTime();
      const elapsed = Date.now() - paid;
      const steps = [
        { after: 5_000, type: "ORDER", status: "PROCESSING", orderStatus: "PROCESSING", shipmentStatus: "PENDING" },
        { after: 10_000, type: "ORDER", status: "PACKED", orderStatus: "PACKED", shipmentStatus: "READY" },
        { after: 15_000, type: "SHIPMENT", status: "PICKED_UP", orderStatus: "SHIPPED", shipmentStatus: "PICKED_UP" },
        { after: 20_000, type: "SHIPMENT", status: "IN_TRANSIT", orderStatus: "SHIPPED", shipmentStatus: "IN_TRANSIT" },
        { after: 25_000, type: "SHIPMENT", status: "DELIVERED", orderStatus: "DELIVERED", shipmentStatus: "DELIVERED" },
      ] as const;
      for (const step of steps) {
        if (elapsed < step.after || next.timeline.some((event) => event.status === step.status)) continue;
        next = {
          ...next,
          status: step.orderStatus,
          shipmentStatus: step.shipmentStatus,
          trackingNumber: step.after >= 15_000 ? `DEMO-${order.orderNumber}` : next.trackingNumber,
          timeline: [...next.timeline, { at: new Date(paid + step.after).toISOString(), type: step.type, status: step.status }],
        };
      }
    }
    if (next !== order) await this.save(next);
    return next;
  }
}
