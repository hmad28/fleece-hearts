import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const admin = await getAdminUser();
  if (!admin) return <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
    <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Fleece Hearts / Studio</span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">Akses belum tersedia</h1>
      <p className="mt-3 text-sm leading-6 text-stone">Akun ini belum terdaftar sebagai staf atau emailnya belum terverifikasi.</p>
      <Link href="/account" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">Kembali ke akun <ArrowUpRight className="size-4" /></Link>
    </div>
  </main>;

  return <div className="min-h-dvh bg-[#f8f7f4] text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
      <Link href="/admin" className="flex h-20 items-center gap-3 border-b border-line px-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand font-display text-xl text-white">FH</span>
        <span><strong className="block text-sm font-bold tracking-tight">Fleece Hearts</strong><small className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-stone">Studio / Admin</small></span>
      </Link>
      <div className="flex-1 overflow-y-auto px-4 py-7"><AdminNav role={admin.adminRole} /></div>
      <div className="border-t border-line p-4"><Link href="/" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-stone hover:bg-mist hover:text-ink">Lihat toko <ArrowUpRight className="size-4" /></Link></div>
    </aside>
    <div className="min-w-0 lg:pl-64">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-7 lg:h-20 lg:px-10">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild><Button type="button" variant="ghost" size="icon" className="rounded-lg lg:hidden" aria-label="Buka navigasi"><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 bg-white p-0">
              <SheetHeader className="border-b border-line p-6 text-left"><SheetTitle>Fleece Hearts</SheetTitle><SheetDescription>Studio / Admin</SheetDescription></SheetHeader>
              <div className="px-4 py-6"><AdminNav mobile role={admin.adminRole} /></div>
            </SheetContent>
          </Sheet>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">Management workspace</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden text-right sm:block"><strong className="block truncate text-xs font-semibold">{admin.email}</strong><span className="text-[10px] uppercase tracking-wider text-stone">{admin.adminRole}</span></div>
          <span className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand" aria-hidden>{admin.email.slice(0, 2).toUpperCase()}</span>
          <AdminSignOut />
        </div>
      </header>
      <main id="konten" className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-7 sm:px-7 lg:px-10 lg:pt-10">{children}</main>
    </div>
  </div>;
}
