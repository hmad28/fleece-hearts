"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, LogOut, MapPin, Menu, MessageCircle, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const items = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/account/chat", label: "Chat admin", icon: MessageCircle },
  { href: "/account#alamat", label: "Alamat", icon: MapPin },
];

function AccountNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <nav aria-label="Navigasi akun" className="space-y-0.5">{items.map((item) => {
    const active = item.href === "/account" ? pathname === "/account" : item.href.includes("#") ? false : pathname.startsWith(item.href);
    const content = <><item.icon className="size-[18px]" strokeWidth={1.8} /><span>{item.label}</span>{active && <span className="ml-auto h-4 w-0.5 rounded-full bg-[#d8979b]" />}</>;
    const className = cn("flex h-11 items-center gap-3 rounded-md px-4 text-[13px] font-medium transition-colors", active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white");
    return mobile ? <SheetClose asChild key={item.href}><Link href={item.href} className={className}>{content}</Link></SheetClose> : <Link key={item.href} href={item.href} className={className} aria-current={active ? "page" : undefined}>{content}</Link>;
  })}</nav>;
}

export function AccountShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = pathname === "/account" ? "Dashboard" : pathname === "/account/orders" ? "Pesanan saya" : pathname.startsWith("/account/orders/") ? "Detail pesanan" : "Chat admin";
  async function signOut() { await authClient.signOut(); router.push("/"); router.refresh(); }
  return <div className="fh-dashboard min-h-dvh bg-[#f6f4f0] text-[#24201e] lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
    <aside className="hidden bg-[#211d1d] lg:flex lg:flex-col">
      <div className="flex h-[72px] items-center border-b border-white/10 px-6 text-[15px] font-semibold text-white">Akun Fleece Hearts</div>
      <div className="flex-1 px-3 py-7"><AccountNav /></div>
      <div className="space-y-3 border-t border-white/10 px-6 py-5"><p className="truncate text-xs text-white/55">{email}</p><Link href="/shop" className="inline-flex items-center gap-2 text-xs text-white/75 hover:text-white">Lihat toko <ArrowUpRight className="size-3.5" /></Link></div>
    </aside>
    <div className="min-w-0">
      <header className="flex h-[72px] items-center justify-between border-b border-[#e6e1d9] bg-[#fdfcf9] px-4 sm:px-7 lg:px-9"><div className="flex min-w-0 items-center gap-3"><Sheet><SheetTrigger asChild><Button type="button" variant="ghost" size="icon" className="rounded-md lg:hidden" aria-label="Buka navigasi akun"><Menu className="size-5" /></Button></SheetTrigger><SheetContent side="left" className="w-[270px] border-0 bg-[#211d1d] p-0 text-white"><SheetHeader className="border-b border-white/10 px-6 py-6 text-left"><SheetTitle className="text-white">Akun Fleece Hearts</SheetTitle><SheetDescription className="text-white/50">{email}</SheetDescription></SheetHeader><div className="px-3 py-6"><AccountNav mobile /></div></SheetContent></Sheet><h1 className="truncate text-lg font-semibold tracking-[-0.035em] sm:text-xl">{title}</h1></div><Button type="button" variant="ghost" size="sm" onClick={() => void signOut()} className="text-stone hover:text-brand"><LogOut className="size-4" /><span className="hidden sm:inline">Keluar</span></Button></header>
      <div className="mx-auto w-full max-w-[1300px] px-4 pb-16 pt-6 sm:px-7 lg:px-9 lg:pt-8">{children}</div>
    </div>
  </div>;
}
