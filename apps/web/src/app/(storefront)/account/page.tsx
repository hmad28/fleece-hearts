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
  return <div className="space-y-7">
    {!data.user.emailVerified && <VerifyEmail email={data.user.email} />}
    <section aria-label="Ringkasan akun" className="grid w-full overflow-hidden rounded-[28px] border border-[#e8e0d8] bg-white shadow-[0_18px_55px_-45px_rgba(65,30,30,0.38)] sm:grid-cols-2">
      <Link href="/account/orders" className="group flex min-h-44 flex-col justify-between gap-8 border-b border-[#eee8e0] p-6 transition-colors hover:bg-[#fbf7f4] sm:border-b-0 sm:border-r sm:p-8"><span className="flex items-center justify-between gap-4 text-base font-medium text-stone">Pesanan <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f5e9e7] text-brand"><ShoppingBag className="size-6" strokeWidth={1.8} /></span></span><strong className="text-5xl font-semibold leading-none tracking-[-0.07em] tabular-nums sm:text-6xl">{orderCount}</strong></Link>
      <Link href="/account/chat" className="group flex min-h-44 flex-col justify-between gap-8 p-6 transition-colors hover:bg-[#fbf7f4] sm:p-8"><span className="flex items-center justify-between gap-4 text-base font-medium text-stone">Chat admin <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f5e9e7] text-brand"><MessageCircle className="size-6" strokeWidth={1.8} /></span></span><strong className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-brand sm:text-3xl">Buka chat <ArrowUpRight className="size-7 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></strong></Link>
    </section>
    <section className="w-full overflow-hidden rounded-[28px] border border-[#e8e0d8] bg-white shadow-[0_18px_55px_-45px_rgba(65,30,30,0.38)]"><div className="flex min-h-20 items-center justify-between gap-4 border-b border-[#eee8e0] px-6 sm:px-8"><h2 className="text-xl font-semibold tracking-tight">Pesanan terbaru</h2><Link href="/account/orders" className="inline-flex items-center gap-2 text-base font-medium text-brand hover:underline">Lihat semua <ArrowUpRight className="size-5" /></Link></div>{recent.rows.length ? recent.rows.map(({ data: order }) => <Link key={order.id} href={`/account/orders/${encodeURIComponent(order.id)}`} className="flex min-h-20 flex-wrap items-center gap-4 border-b border-[#eee8e0] px-6 transition-colors last:border-b-0 hover:bg-[#fbf7f4] sm:flex-nowrap sm:px-8"><span className="min-w-0 flex-1"><strong className="block text-base font-semibold">{order.orderNumber}</strong><small className="text-sm text-stone">{new Date(order.createdAt).toLocaleDateString("id-ID")}</small></span><Badge tone="muted" className="px-3 py-1 text-sm">{order.status}</Badge><strong className="text-base tabular-nums">Rp{order.total.toLocaleString("id-ID")}</strong><ArrowUpRight className="size-5 shrink-0 text-brand" /></Link>) : <div className="px-6 py-16 text-center"><p className="text-base text-stone">Belum ada pesanan.</p><Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-brand">Lihat produk <ArrowUpRight className="size-5" /></Link></div>}</section>
    <AccountAddress />
  </div>;
}
