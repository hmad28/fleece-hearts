import type { Order } from "@fh/types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const { id } = await params;
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE id=$1 AND customer_user_id=$2", [id, data.user.id]);
  const order = rows[0]?.data;
  if (!order) notFound();
  return <main className="mx-auto max-w-3xl px-4 py-16"><Link href="/account/orders" className="text-sm underline">← Semua pesanan</Link><h1 className="font-display mt-8 text-5xl">{order.orderNumber}</h1><p className="mt-4">{order.status} · {order.paymentStatus} · {order.shipmentStatus}</p><div className="mt-8 space-y-2 border-y border-line py-5">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4"><span>{item.productName} / {item.size} × {item.quantity}</span><span>Rp{item.lineTotal.toLocaleString("id-ID")}</span></div>)}<div className="flex justify-between font-semibold"><span>Total</span><span>Rp{order.total.toLocaleString("id-ID")}</span></div></div><h2 className="font-display mt-8 text-3xl">Pengiriman</h2><p className="mt-3">{order.shippingAddress.line1}, {order.shippingAddress.city}</p><p>{order.courierCode} {order.courierService} · {order.trackingNumber || "Resi belum tersedia"}</p><h2 className="font-display mt-8 text-3xl">Riwayat status</h2><ol className="mt-4 space-y-3">{order.timeline.map((event, index) => <li key={index} className="border-l-2 border-ink pl-4"><time className="text-xs text-stone">{new Date(event.at).toLocaleString("id-ID")}</time><p>{event.status} {event.note && `· ${event.note}`}</p></li>)}</ol><Link href="/account/chat" className="mt-8 inline-block underline">Tanyakan pesanan ke admin</Link></main>;
}
