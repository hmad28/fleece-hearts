"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, CreditCard, Heart, HelpCircle, LayoutDashboard, LogOut, MapPin, Menu, MessageCircle, Search, Settings2, ShoppingBag, Store, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/wordmark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const sections = [
  { label: "BELANJA", items: [
    { href: "/account", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/account/orders", label: "Pesanan saya", icon: ShoppingBag },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  ] },
  { label: "AKUN", items: [
    { href: "/account/addresses", label: "Alamat tersimpan", icon: MapPin },
    { href: "/account/payments", label: "Pembayaran", icon: CreditCard },
    { href: "/account/settings", label: "Profil & keamanan", icon: Settings2 },
  ] },
  { label: "BANTUAN", items: [
    { href: "/account/chat", label: "Chat admin", icon: MessageCircle },
    { href: "/account/help", label: "Pusat bantuan", icon: HelpCircle },
  ] },
];

const titles: Record<string, string> = {
  "/account": "Ringkasan akun", "/account/orders": "Pesanan saya", "/account/wishlist": "Wishlist",
  "/account/addresses": "Alamat tersimpan", "/account/payments": "Pembayaran",
  "/account/settings": "Profil & keamanan", "/account/chat": "Chat admin", "/account/help": "Pusat bantuan",
};

function AccountNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <nav aria-label="Navigasi akun" className="space-y-7">{sections.map((section) => <div key={section.label}>
    <p className="mb-2 px-4 text-[11px] font-semibold tracking-[0.16em] text-white/55">{section.label}</p>
    <div className="space-y-1">{section.items.map((item) => {
      const active = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
      const className = cn("flex h-11 items-center gap-3 rounded-xl px-4 text-[0.95rem] font-medium transition-colors", active ? "bg-white text-brand" : "text-white/80 hover:bg-white/10 hover:text-white");
      const content = <><item.icon className="size-[19px] shrink-0" strokeWidth={1.8} /><span>{item.label}</span></>;
      return mobile ? <SheetClose asChild key={item.href}><Link href={item.href} className={className}>{content}</Link></SheetClose> : <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>;
    })}</div>
  </div>)}</nav>;
}

export function AccountShell({ email, name, children }: { email: string; name: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = titles[pathname] ?? (pathname.startsWith("/account/orders/") ? "Detail pesanan" : "Akun saya");
  const firstName = name.trim().split(/\s+/)[0] || "Fleece Heart";
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FH";
  async function signOut(toAuth = false) { await authClient.signOut(); router.push(toAuth ? "/auth" : "/"); router.refresh(); }

  return <div className="fh-dashboard flex h-dvh overflow-hidden bg-[#f7f5f2] text-[#24201e]">
    <aside className="hidden w-[252px] shrink-0 flex-col bg-brand lg:flex">
      <Link href="/account" className="flex h-[76px] items-center border-b border-white/15 px-6 text-white"><Wordmark /></Link>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-6"><AccountNav /></div>
      <div className="space-y-3 border-t border-white/15 px-6 py-5"><p className="truncate text-sm text-white/75">{email}</p><Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-white hover:underline"><Store className="size-4" /> Kembali ke toko</Link></div>
    </aside>

    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-[76px] shrink-0 items-center gap-3 border-b border-[#e7e0d9] bg-white px-4 sm:px-7 lg:px-9">
        <Sheet><SheetTrigger asChild><Button type="button" variant="ghost" size="icon" className="shrink-0 lg:hidden" aria-label="Buka navigasi akun"><Menu className="size-5" /></Button></SheetTrigger><SheetContent side="left" className="w-[280px] border-0 bg-brand p-0 text-white"><SheetHeader className="border-b border-white/15 px-6 py-6 text-left"><SheetTitle className="text-white"><Wordmark /></SheetTitle><SheetDescription className="text-white/75">{email}</SheetDescription></SheetHeader><div className="max-h-[calc(100dvh-6rem)] overflow-y-auto px-3 py-6"><AccountNav mobile /></div></SheetContent></Sheet>
        <div className="min-w-0 flex-1"><p className="truncate text-[11px] text-stone sm:text-xs">Halo, {firstName}</p><h1 className="truncate text-[1.05rem] font-semibold tracking-tight sm:text-[1.3rem]">{title}</h1></div>
        <form action="/shop" className="hidden h-10 w-52 items-center gap-2 rounded-full border border-[#e7e0d9] bg-[#faf9f7] px-3 xl:flex 2xl:w-72"><Search className="size-4 shrink-0 text-stone" /><input name="q" type="search" aria-label="Cari produk" placeholder="Cari produk..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></form>
        <Link href="/shop" aria-label="Cari produk" className="flex size-10 shrink-0 items-center justify-center rounded-full text-stone hover:bg-[#f5f0ec] xl:hidden"><Search className="size-5" /></Link>
        <Link href="/account/orders?status=active" aria-label="Lihat pesanan aktif" title="Pesanan aktif" className="flex size-10 shrink-0 items-center justify-center rounded-full text-stone hover:bg-[#f5f0ec]"><Bell className="size-5" /></Link>
        <details className="group relative shrink-0"><summary aria-label="Menu akun" className="flex cursor-pointer list-none items-center gap-1 rounded-full outline-offset-2 [&::-webkit-details-marker]:hidden"><Avatar size="lg"><AvatarFallback className="bg-brand/10 font-semibold text-brand">{initials}</AvatarFallback></Avatar><ChevronDown className="hidden size-4 text-stone sm:block" /></summary><div className="absolute right-0 z-30 mt-3 w-48 rounded-2xl border border-[#e7e0d9] bg-white p-2 shadow-lg"><Link href="/account/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[#f7f3f0]"><UserRound className="size-4" /> Profil</Link><button type="button" onClick={() => void signOut(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f7f3f0]"><LogOut className="size-4" /> Ganti akun</button><button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-brand hover:bg-[#f7f3f0]"><LogOut className="size-4" /> Keluar</button></div></details>
      </header>
      <main id="panel-akun" className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-4 pb-16 pt-6 sm:px-7 lg:px-9 lg:pt-8">{children}</main>
    </div>
  </div>;
}
