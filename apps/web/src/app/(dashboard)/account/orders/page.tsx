import type { Order } from "@fh/types";
import { formatRupiah } from "@fh/shared";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";
import { OrderStatusPill } from "@/components/account/order-status";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const { status = "all" } = await searchParams;
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE customer_user_id=$1 ORDER BY created_at DESC LIMIT 200", [data.user.id]);
  const orders = rows.map((row) => row.data);
  const filtered = orders.filter((order) => status === "active" ? !["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status) : status === "delivered" ? order.status === "DELIVERED" : status === "cancelled" ? order.status === "CANCELLED" : true);
  const tabs = [{ id: "all", label: "Semua" }, { id: "active", label: "Aktif" }, { id: "delivered", label: "Sampai" }, { id: "cancelled", label: "Dibatalkan" }];

  return <div className="space-y-5">
    <nav aria-label="Filter status pesanan" className="flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <Link key={tab.id} href={tab.id === "all" ? "/account/orders" : `/account/orders?status=${tab.id}`} aria-current={status === tab.id ? "page" : undefined} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${status === tab.id ? "bg-brand text-white" : "border border-[#e7e0d9] bg-white text-stone hover:text-brand"}`}>{tab.label}</Link>)}</nav>
    {filtered.length ? <div className="grid gap-4">{filtered.map((order) => <article key={order.id} className="overflow-hidden rounded-[22px] border border-[#e9e2dc] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e2] px-5 py-4 sm:px-6"><div><p className="font-semibold">{order.orderNumber}</p><time className="text-sm text-stone">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</time></div><OrderStatusPill order={order} /></div><div className="flex flex-wrap items-center gap-4 px-5 py-5 sm:flex-nowrap sm:px-6"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2ede7]">{order.items[0]?.imageUrl ? <img src={order.items[0].imageUrl} alt="" className="size-full object-cover" /> : <Package className="size-7 text-stone" />}</div><div className="min-w-0 flex-1"><p className="font-medium">{order.items[0]?.productName ?? "Pesanan"}</p><p className="mt-1 text-sm text-stone">{order.items.length} jenis produk · {order.items.reduce((sum, item) => sum + item.quantity, 0)} item</p></div><strong className="text-base tabular-nums">{formatRupiah(order.total)}</strong></div><div className="flex flex-wrap justify-end gap-2 border-t border-[#eee8e2] px-5 py-4 sm:px-6"><Link href={`/account/orders/${encodeURIComponent(order.id)}`} className="inline-flex items-center gap-2 rounded-full border border-[#e7e0d9] px-4 py-2 text-sm font-semibold text-[#24201e] hover:bg-[#f8f4f0]">Lihat invoice</Link><Link href={`/account/orders/${encodeURIComponent(order.id)}#tracking`} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-press">Lacak paket <ArrowRight className="size-4" /></Link></div></article>)}</div> : <div className="rounded-[22px] border border-[#e9e2dc] bg-white px-6 py-16 text-center"><Package className="mx-auto size-8 text-stone" /><p className="mt-4 text-stone">Belum ada pesanan di kategori ini.</p><Link href="/shop" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">Lihat produk <ArrowRight className="size-4" /></Link></div>}
  </div>;
}
