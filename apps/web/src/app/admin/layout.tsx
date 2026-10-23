import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const admin = await getAdminUser();
  if (!admin) return <main className="flex min-h-dvh flex-col justify-center bg-paper px-6 py-24">
    <div className="mx-auto w-full max-w-xl border-t-2 border-brand pt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Fleece Hearts / Admin</p>
      <h1 className="font-display mt-6 text-6xl">Akses belum tersedia.</h1>
      <p className="mt-6 max-w-md leading-relaxed text-stone">Akun ini belum terdaftar sebagai staf atau emailnya belum terverifikasi.</p>
      <Link href="/account" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4">Kembali ke akun <ArrowUpRight className="size-4" aria-hidden /></Link>
    </div>
  </main>;

  return <div className="min-h-dvh bg-paper text-ink">
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex min-h-20 max-w-[100rem] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <Link href="/admin" className="flex items-center gap-3" aria-label="Fleece Hearts, ringkasan admin">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand font-display text-xl text-paper">FH</span>
          <span><strong className="block text-sm font-semibold tracking-tight">Fleece Hearts</strong><span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone">Management studio</span></span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="hidden text-right sm:block"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{admin.adminRole}</p><p className="mt-0.5 max-w-56 truncate text-xs text-stone">{admin.email}</p></div>
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs font-semibold transition-colors hover:border-ink hover:bg-mist">Lihat toko <ArrowUpRight className="size-3.5" aria-hidden /></Link>
          <AdminSignOut />
        </div>
      </div>
    </header>
    <div className="mx-auto grid max-w-[100rem] lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-mist/50 lg:min-h-[calc(100dvh-5rem)] lg:border-b-0 lg:border-r lg:pt-9">
        <p className="hidden px-9 pb-6 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone lg:block">Workspace / Production</p>
        <div className="pt-4 lg:pt-0"><AdminNav /></div>
        <div className="hidden px-9 pb-10 pt-14 lg:block"><span className="block h-px bg-line" /><p className="mt-5 text-xs leading-relaxed text-stone">Kelola katalog, pesanan, konten, dan percakapan dari satu tempat.</p></div>
      </aside>
      <main id="konten" className="min-w-0 px-5 pb-20 pt-9 sm:px-8 lg:px-12 lg:pt-12">{children}</main>
    </div>
  </div>;
}
