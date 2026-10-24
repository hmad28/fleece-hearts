import type { Order } from "@fh/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Package } from "lucide-react";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export default async function CustomerOrdersPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE customer_user_id=$1 ORDER BY created_at DESC LIMIT 100", [data.user.id]);
  return <main className="min-h-[70vh] bg-[#f8f7f4] px-4 py-10 sm:px-7 lg:py-14"><div className="mx-auto max-w-5xl"><Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"><ArrowLeft className="size-4" /> Kembali ke akun</Link><div className="mb-7 mt-6"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-brand">Akun / Riwayat</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Pesanan saya</h1><p className="mt-2 text-sm text-stone">Lihat detail dan status pesananmu.</p></div><div className="space-y-3">{rows.map(({ data: order }) => <Link key={order.id} href={`/account/orders/${encodeURIComponent(order.id)}`} className="group block"><Card className="border-line bg-white py-5 shadow-none transition-colors hover:border-brand/30"><CardContent className="flex flex-wrap items-center gap-4 sm:flex-nowrap"><span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"><Package className="size-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{order.orderNumber}</strong><small className="text-stone">{new Date(order.createdAt).toLocaleDateString("id-ID")} · {order.items.length} produk</small></span><Badge tone={order.status === "DELIVERED" ? "brand" : "muted"}>{order.status}</Badge><strong className="text-sm tabular-nums">Rp{order.total.toLocaleString("id-ID")}</strong><ArrowUpRight className="size-4 text-stone group-hover:text-brand" /></CardContent></Card></Link>)}{rows.length === 0 && <Card className="border-line bg-white shadow-none"><CardContent className="py-16 text-center"><Package className="mx-auto size-9 text-stone/40" /><h2 className="mt-4 text-base font-semibold">Belum ada pesanan</h2><p className="mt-1 text-sm text-stone">Mulai jelajahi koleksi Fleece Hearts.</p><ButtonLink href="/shop" variant="brand" size="sm" className="mt-5">Lihat katalog</ButtonLink></CardContent></Card>}</div></div></main>;
}
