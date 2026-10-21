import type { CreateOrderInput, ID, Order, OrderItem, OrderLookupInput, ShippingProvider } from "@fh/types";
import { COD_MAX_KM } from "@/mocks/data/commerce";
import { checkoutSchema } from "@fh/validation";
import type { OrderService } from "../contracts";
import type { MockCatalogService } from "./catalog";
import type { MockDropService } from "./drops";
import type { MockPaymentProvider } from "./payment";
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
    private readonly payment: MockPaymentProvider,
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
        latitude: input.shippingAddress.latitude,
        longitude: input.shippingAddress.longitude,
      },
      distanceKm: input.distanceKm,
      weightGram,
      itemValue: subtotal,
    });
    const rate = rates.find((r) => r.courierCode === input.courierCode && r.service === input.courierService);
    if (!rate || rate.available === false) throw new Error(rate?.reason ?? "Layanan kurir tidak tersedia");

    const now = new Date();
    const id = mockId("ord");
    const orderNumber = this.nextOrderNumber(now);
    const method = (await this.payment.listMethods()).find((item) => item.code === input.paymentMethodCode);
    if (!method) throw new Error("Metode pembayaran tidak tersedia");
    if (method.type === "COD" && (input.distanceKm ?? Infinity) > COD_MAX_KM) throw new Error(`COD hanya untuk tujuan ≤ ${COD_MAX_KM} km dari toko`);
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
      status: method.type === "COD" ? "CONFIRMED" : "PENDING",
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
      distanceKm: input.distanceKm,
      etaLabel: rate.etaLabel,
      createdAt: now.toISOString(),
      timeline: method.type === "COD"
        ? [
            { at: now.toISOString(), type: "ORDER", status: "PENDING", note: "Order dibuat" },
            { at: now.toISOString(), type: "ORDER", status: "CONFIRMED", note: "COD dikonfirmasi, bayar saat paket sampai" },
          ]
        : [{ at: now.toISOString(), type: "ORDER", status: "PENDING", note: "Order dibuat" }],
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

  /**
   * Simulasi efek webhook: payment PAID → order CONFIRMED, lalu status kirim maju otomatis.
   * COD: alur kirim mulai dari waktu order dibuat; pembayaran lunas saat paket sampai.
   * Kalau admin sudah mengubah status manual, timeline admin yang dipakai.
   */
  private async syncPayment(order: Order): Promise<Order> {
    if (!order.paymentId) return order;
    let payment = await this.payment.getPaymentStatus(order.paymentId);
    const cod = payment.instructions.cod === true;
    let next = order;
    if (!cod && payment.status !== order.paymentStatus) {
      next = {
        ...order,
        paymentStatus: payment.status,
        status: payment.status === "PAID" ? "CONFIRMED" : "CANCELLED",
        timeline: [...order.timeline, { at: payment.paidAt ?? new Date().toISOString(), type: "PAYMENT", status: payment.status }],
      };
    }

    const startIso = cod ? order.createdAt : payment.status === "PAID" ? payment.paidAt : undefined;
    if (startIso) {
      const start = new Date(startIso).getTime();
      const elapsed = Date.now() - start;
      const steps = [
        { after: TRACKING_STEPS_MS.PROCESSING, type: "ORDER", status: "PROCESSING", orderStatus: "PROCESSING", shipmentStatus: "PENDING" },
        { after: TRACKING_STEPS_MS.PACKED, type: "ORDER", status: "PACKED", orderStatus: "PACKED", shipmentStatus: "READY" },
        { after: TRACKING_STEPS_MS.PICKED_UP, type: "SHIPMENT", status: "PICKED_UP", orderStatus: "SHIPPED", shipmentStatus: "PICKED_UP" },
        { after: TRACKING_STEPS_MS.IN_TRANSIT, type: "SHIPMENT", status: "IN_TRANSIT", orderStatus: "SHIPPED", shipmentStatus: "IN_TRANSIT" },
        { after: TRACKING_STEPS_MS.DELIVERED, type: "SHIPMENT", status: "DELIVERED", orderStatus: "DELIVERED", shipmentStatus: "DELIVERED" },
      ] as const;
      for (const step of steps) {
        if (elapsed < step.after || next.timeline.some((event) => event.status === step.status)) continue;
        const at = new Date(start + step.after).toISOString();
        next = {
          ...next,
          status: step.orderStatus,
          shipmentStatus: step.shipmentStatus,
          trackingNumber: step.after >= TRACKING_STEPS_MS.PICKED_UP ? next.trackingNumber ?? `DEMO-${order.orderNumber}` : next.trackingNumber,
          timeline: [...next.timeline, { at, type: step.type, status: step.status }],
        };
        if (cod && step.status === "DELIVERED") {
          payment = (await this.payment.settleCod(payment.id, at)) ?? payment;
          next = { ...next, paymentStatus: "PAID", timeline: [...next.timeline, { at, type: "PAYMENT", status: "PAID", note: "COD dibayar ke kurir" }] };
        }
      }
    }
    if (next !== order) await this.save(next);
    return next;
  }
}

/** Jadwal simulasi status (ms setelah pembayaran berhasil / COD dibuat). */
export const TRACKING_STEPS_MS = {
  PROCESSING: 5_000,
  PACKED: 12_000,
  PICKED_UP: 20_000,
  IN_TRANSIT: 28_000,
  DELIVERED: 88_000,
} as const;
