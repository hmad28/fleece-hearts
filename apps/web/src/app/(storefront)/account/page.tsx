import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { AccountAddress } from "@/components/account/account-address";
import { VerifyEmail } from "@/components/account/verify-email";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Akun Saya" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");

  // Staff land in the management workspace after sign-in. This page belongs to customers.
  if (await getAdminUser()) redirect("/admin");

  const { rows } = await getDb().query<{ count: string }>(
    "SELECT count(*)::text AS count FROM demo_orders WHERE customer_user_id=$1",
    [data.user.id],
  );
  const orderCount = Number(rows[0]?.count ?? 0);

  return <div className="bg-paper">
    {!data.user.emailVerified && <VerifyEmail email={data.user.email} />}

    <section className="mx-auto grid max-w-[90rem] lg:min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.84fr)]">
      <div className="flex flex-col justify-between px-5 pb-12 pt-10 sm:px-10 lg:px-14 lg:pb-16 lg:pt-14">
        <div className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone">
          <span className="size-2 rounded-full bg-brand" /> Fleece Hearts <span className="text-line">/</span> Akun
        </div>
        <div className="mt-20 max-w-2xl lg:mt-12">
          <h1 className="font-display text-[clamp(4rem,9vw,8.5rem)] leading-[0.84] tracking-[-0.055em]">Ruang<br />kamu<span className="text-brand">.</span></h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-stone sm:text-lg">Semua tentang pesanan, percakapan, dan alamat pengiriman dalam satu tempat.</p>
        </div>
        <div className="mt-12 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-stone"><span className="h-px w-9 bg-brand" /> Dibuat untuk perjalananmu</div>
      </div>
      <div className="relative min-h-64 overflow-hidden bg-mist lg:min-h-full">
        <Image src="/images/dummy/hero-model.jpg" alt="Model mengenakan fleece dalam kampanye Fleece Hearts" fill priority className="object-cover object-[center_42%]" sizes="(min-width: 1024px) 45vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <p className="absolute bottom-5 left-5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white sm:bottom-8 sm:left-8">Fleece Hearts / Everyday warmth</p>
      </div>
    </section>

    <div className="mx-auto max-w-[90rem] px-5 pb-24 pt-16 sm:px-10 lg:px-14 lg:pt-24">
      <section aria-labelledby="account-overview" className="grid gap-10 lg:grid-cols-[minmax(14rem,0.42fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand">01 / Aktivitas</p>
          <h2 id="account-overview" className="font-display mt-5 text-4xl sm:text-5xl">Sekilas akun</h2>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone">Lihat pesanan yang sedang berjalan atau mulai percakapan dengan tim kami.</p>
        </div>
        <div className="border-t border-ink">
          <Link href="/account/orders" className="group flex items-center gap-5 border-b border-line py-7 transition-colors hover:text-brand focus-visible:outline-offset-[-3px] sm:gap-9 sm:py-9">
            <span className="font-display min-w-14 text-5xl tabular sm:min-w-20 sm:text-6xl">{String(orderCount).padStart(2, "0")}</span>
            <span className="flex-1"><strong className="block text-lg font-semibold sm:text-xl">Pesanan saya</strong><span className="mt-1 block text-sm text-stone">{orderCount ? "Lihat status dan detail pembelian" : "Belum ada pesanan, mulai dari katalog"}</span></span>
            <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
          </Link>
          <Link href="/account/chat" className="group flex items-center gap-5 border-b border-line py-7 transition-colors hover:text-brand focus-visible:outline-offset-[-3px] sm:gap-9 sm:py-9">
            <span className="font-display min-w-14 text-5xl text-brand sm:min-w-20 sm:text-6xl">↗</span>
            <span className="flex-1"><strong className="block text-lg font-semibold sm:text-xl">Tanya tim kami</strong><span className="mt-1 block text-sm text-stone">Produk, ukuran, atau pesananmu</span></span>
            <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
          </Link>
          {orderCount === 0 && <Link href="/shop" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4 hover:text-brand-press">Jelajahi koleksi <ArrowUpRight className="size-4" aria-hidden /></Link>}
        </div>
      </section>

      <AccountAddress name={data.user.name} email={data.user.email} />
    </div>
  </div>;
}
