import type { Order } from "@fh/types";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, MessageCircle, ShoppingBag } from "lucide-react";
import { AccountAddress } from "@/components/account/account-address";
import { VerifyEmail } from "@/components/account/verify-email";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Akun Saya" };
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  if (await getAdminUser()) redirect("/admin");
  const db = getDb();
  const [count, recent] = await Promise.all([
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM demo_orders WHERE customer_user_id=$1", [data.user.id]),
    db.query<{ data: Order }>("SELECT data FROM demo_orders WHERE customer_user_id=$1 ORDER BY created_at DESC LIMIT 4", [data.user.id]),
  ]);
  const orderCount = Number(count.rows[0]?.count ?? 0);
  return <div className="space-y-6">
    {!data.user.emailVerified && <VerifyEmail email={data.user.email} />}
    <div className="grid grid-cols-2 border border-[#e6e1d9] bg-white"><Link href="/account/orders" className="group flex min-h-28 flex-col justify-between border-r border-[#e6e1d9] p-5 hover:bg-[#faf7f3] sm:p-6"><span className="flex items-center justify-between text-xs text-stone">Pesanan <ShoppingBag className="size-4 text-brand" /></span><strong className="text-4xl font-semibold leading-none tracking-[-0.06em] tabular-nums">{orderCount}</strong></Link><Link href="/account/chat" className="group flex min-h-28 flex-col justify-between p-5 hover:bg-[#faf7f3] sm:p-6"><span className="flex items-center justify-between text-xs text-stone">Chat admin <MessageCircle className="size-4 text-brand" /></span><strong className="flex items-center gap-2 text-sm font-semibold text-brand">Buka chat <ArrowUpRight className="size-4" /></strong></Link></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <section className="h-fit border border-[#e6e1d9] bg-white"><div className="flex h-14 items-center justify-between border-b border-[#e6e1d9] px-5"><h2 className="text-sm font-semibold">Pesanan terbaru</h2><Link href="/account/orders" className="text-xs font-medium text-brand hover:underline">Lihat semua</Link></div>{recent.rows.length ? recent.rows.map(({ data: order }) => <Link key={order.id} href={`/account/orders/${encodeURIComponent(order.id)}`} className="flex items-center gap-3 border-b border-[#eee9e2] px-5 py-4 last:border-b-0 hover:bg-[#faf7f3]"><span className="min-w-0 flex-1"><strong className="block text-sm">{order.orderNumber}</strong><small className="text-stone">{new Date(order.createdAt).toLocaleDateString("id-ID")}</small></span><Badge tone="muted">{order.status}</Badge><strong className="text-sm tabular-nums">Rp{order.total.toLocaleString("id-ID")}</strong></Link>) : <div className="p-10 text-center"><p className="text-sm text-stone">Belum ada pesanan.</p><Link href="/shop" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand">Lihat produk <ArrowUpRight className="size-3.5" /></Link></div>}</section>
      <AccountAddress />
    </div>
  </div>;
}
