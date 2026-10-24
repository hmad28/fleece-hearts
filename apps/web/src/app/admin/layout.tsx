import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminHeaderTitle } from "@/components/admin/admin-header-title";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const admin = await getAdminUser();
  if (!admin) return <main className="flex min-h-dvh items-center justify-center bg-[#f6f4f0] px-6"><div className="w-full max-w-md border border-line bg-white p-8"><h1 className="text-2xl font-semibold">Akses belum tersedia</h1><p className="mt-3 text-sm text-stone">Akun ini belum terdaftar sebagai staf atau emailnya belum terverifikasi.</p><Link href="/account" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">Kembali ke akun <ArrowUpRight className="size-4" /></Link></div></main>;

  return <div className="fh-dashboard flex h-dvh overflow-hidden bg-[#f6f4f0] font-sans text-[#24201e]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col bg-brand lg:flex">
      <Link href="/admin" className="flex h-[72px] items-center gap-3 border-b border-white/10 px-6">
        <Wordmark className="text-white" />
      </Link>
      <div className="flex-1 overflow-y-auto px-3 py-7"><AdminNav role={admin.adminRole} /></div>
      <div className="border-t border-white/10 px-3 py-4"><Link href="/" className="flex h-11 items-center justify-between rounded-md px-4 text-[13px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white">Lihat toko <ArrowUpRight className="size-4" /></Link></div>
    </aside>
    <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-[244px]">
      <header className="z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-[#e6e1d9] bg-[#fdfcf9]/95 px-4 backdrop-blur sm:px-7 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet><SheetTrigger asChild><Button type="button" variant="ghost" size="icon" className="rounded-xl lg:hidden" aria-label="Buka navigasi"><Menu className="size-6" /></Button></SheetTrigger><SheetContent side="left" className="w-[270px] border-0 bg-brand p-0 text-white"><SheetHeader className="border-b border-white/10 px-6 py-6 text-left"><SheetTitle className="text-white"><Wordmark /></SheetTitle><SheetDescription className="text-white/70">Admin</SheetDescription></SheetHeader><div className="px-3 py-6"><AdminNav mobile role={admin.adminRole} /></div></SheetContent></Sheet>
          <AdminHeaderTitle />
        </div>
        <div className="flex items-center gap-4"><span className="hidden max-w-48 truncate text-sm font-medium text-stone sm:block">{admin.email}</span><span className="flex size-10 items-center justify-center rounded-xl bg-[#eee4df] text-xs font-bold text-brand" aria-hidden>{admin.email.slice(0, 2).toUpperCase()}</span><AdminSignOut /></div>
      </header>
      <main id="konten" className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-4 pb-16 pt-6 sm:px-7 lg:px-10 lg:pt-9">{children}</main>
    </div>
  </div>;
}
