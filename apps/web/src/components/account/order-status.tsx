import type { Order } from "@fh/types";

export function orderStatusLabel(order: Order) {
  if (order.status === "CANCELLED" || order.status === "RETURNED") return order.status === "RETURNED" ? "Diretur" : "Dibatalkan";
  if (order.status === "RETURN_REQUESTED") return "Retur diajukan";
  if (order.status === "DELIVERED" || order.shipmentStatus === "DELIVERED") return "Sampai";
  if (order.status === "SHIPPED" || order.shipmentStatus === "IN_TRANSIT") return "Dikirim";
  if (order.status === "PACKED" || order.shipmentStatus === "READY") return "Siap dikirim";
  if (order.status === "PROCESSING" || order.status === "CONFIRMED") return "Diproses";
  if (order.paymentStatus === "PENDING") return "Menunggu bayar";
  return "Pesanan dibuat";
}

export function OrderStatusPill({ order }: { order: Order }) {
  const label = orderStatusLabel(order);
  const color = label === "Sampai" ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : label === "Dibatalkan" || label === "Diretur" ? "bg-red-50 text-red-700 ring-red-200"
      : label === "Menunggu bayar" || label === "Retur diajukan" ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-sky-50 text-sky-700 ring-sky-200";
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${color}`}>{label}</span>;
}
