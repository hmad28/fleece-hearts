"use client";

import type { Order, OrderStatus, ShipmentStatus } from "@fh/types";
import { useState } from "react";

const orderStatuses: OrderStatus[] = ["PENDING","CONFIRMED","PROCESSING","PACKED","SHIPPED","DELIVERED","CANCELLED","RETURN_REQUESTED","RETURNED"];
const shipmentStatuses: ShipmentStatus[] = ["PENDING","READY","PICKED_UP","IN_TRANSIT","DELIVERED","FAILED","RETURNED"];

export function OrderManager({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [message, setMessage] = useState("");
  async function save(order: Order) {
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: order.status, shipmentStatus: order.shipmentStatus, trackingNumber: order.trackingNumber ?? "", note: "Status diperbarui tim toko" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setOrders((current) => current.map((item) => item.id === order.id ? result : item));
      setMessage(`${order.orderNumber} tersimpan.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan."); }
  }
  function update(id: string, patch: Partial<Order>) { setOrders((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  return <div className="space-y-5">{message && <p role="status" className="rounded-xl bg-mist p-3">{message}</p>}{orders.map((order) => <article key={order.id} className="rounded-2xl border border-line p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">{order.orderNumber}</h2><p className="text-sm text-stone">{order.customer.name} · {order.customer.email}</p></div><strong>Rp{order.total.toLocaleString("id-ID")}</strong></div><p className="mt-3 text-sm">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p><dl className="mt-3 grid gap-x-6 gap-y-1 text-xs text-stone sm:grid-cols-2"><div>Kirim ke: {[order.shippingAddress.village, order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(", ")}</div><div>Kurir: {order.courierCode.toUpperCase()} {order.courierService}{order.etaLabel ? ` · ${order.etaLabel}` : ""}{order.distanceKm ? ` · ±${order.distanceKm} km` : ""}</div><div>Bayar: {order.paymentMethodCode} · {order.paymentStatus}</div><div>Dibuat: {new Date(order.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</div></dl><div className="mt-5 grid gap-3 md:grid-cols-3"><label className="text-sm">Status order<select value={order.status} onChange={(event) => update(order.id, { status: event.target.value as OrderStatus })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2">{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-sm">Status pengiriman<select value={order.shipmentStatus} onChange={(event) => update(order.id, { shipmentStatus: event.target.value as ShipmentStatus })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2">{shipmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-sm">Nomor resi<input value={order.trackingNumber ?? ""} onChange={(event) => update(order.id, { trackingNumber: event.target.value })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2" /></label></div><button onClick={() => void save(order)} className="mt-5 rounded-full bg-ink px-5 py-2 text-sm text-paper">Simpan status</button></article>)}{orders.length === 0 && <p className="text-stone">Belum ada pesanan demo dari customer yang masuk akun.</p>}</div>;
}
