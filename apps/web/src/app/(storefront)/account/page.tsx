import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, MapPin, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { AccountAddress } from "@/components/account/account-address";
import { VerifyEmail } from "@/components/account/verify-email";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Akun Saya" };
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  if (await getAdminUser()) redirect("/admin");
  const { rows } = await getDb().query<{ count: string }>("SELECT count(*)::text AS count FROM demo_orders WHERE customer_user_id=$1", [data.user.id]);
  const orderCount = Number(rows[0]?.count ?? 0);
  return <main className="bg-[#f8f7f4] px-4 pb-20 pt-9 sm:px-7 lg:pt-14"><div className="mx-auto max-w-6xl">
    {!data.user.emailVerified && <VerifyEmail email={data.user.email} />}
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-brand">Fleece Hearts / Akun</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Halo, {data.user.name?.split(" ")[0] || "kamu"}.</h1><p className="mt-2 text-sm text-stone">Kelola pesanan, alamat, dan percakapan dari sini.</p></div><ButtonLink href="/shop" variant="brand" size="sm">Jelajahi produk <ArrowUpRight className="size-4" /></ButtonLink></div>
    <div className="grid gap-4 md:grid-cols-3">
      <Link href="/account/orders" className="group"><Card className="h-full border-line bg-white shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md"><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle className="text-base">Pesanan saya</CardTitle><CardDescription className="mt-1">Lacak dan lihat riwayat</CardDescription></div><span className="rounded-lg bg-brand/10 p-2 text-brand"><ShoppingBag className="size-5" /></span></CardHeader><CardContent><strong className="text-3xl font-semibold tabular-nums">{orderCount}</strong><span className="ml-2 text-xs text-stone">pesanan</span><p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">Lihat pesanan <ArrowUpRight className="size-3.5" /></p></CardContent></Card></Link>
      <Link href="/account/chat" className="group"><Card className="h-full border-line bg-white shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md"><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle className="text-base">Chat dengan admin</CardTitle><CardDescription className="mt-1">Bantuan produk & pesanan</CardDescription></div><span className="rounded-lg bg-brand/10 p-2 text-brand"><MessageCircle className="size-5" /></span></CardHeader><CardContent><p className="max-w-xs text-sm leading-6 text-stone">Ada pertanyaan? Tulis langsung ke tim Fleece Hearts.</p><p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">Mulai chat <ArrowUpRight className="size-3.5" /></p></CardContent></Card></Link>
      <a href="#alamat" className="group"><Card className="h-full border-line bg-white shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md"><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle className="text-base">Alamat utama</CardTitle><CardDescription className="mt-1">Untuk checkout berikutnya</CardDescription></div><span className="rounded-lg bg-brand/10 p-2 text-brand"><MapPin className="size-5" /></span></CardHeader><CardContent><p className="max-w-xs text-sm leading-6 text-stone">Simpan tujuan pengiriman agar belanja lebih cepat.</p><p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">Atur alamat <ArrowUpRight className="size-3.5" /></p></CardContent></Card></a>
    </div>
    {orderCount === 0 && <Card className="mt-6 flex flex-row flex-wrap items-center justify-between gap-4 border-brand/15 bg-brand/5 shadow-none"><div className="flex items-center gap-3 px-6"><Package className="size-5 text-brand" /><div><CardTitle className="text-sm">Belum ada pesanan</CardTitle><CardDescription className="mt-1">Koleksi Fleece Hearts menunggu kamu.</CardDescription></div></div><Link href="/shop" className="px-6 text-xs font-semibold text-brand hover:underline">Lihat katalog →</Link></Card>}
    <AccountAddress name={data.user.name} email={data.user.email} />
  </div></main>;
}
