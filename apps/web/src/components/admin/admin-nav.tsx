"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Images, LayoutDashboard, MessageCircle, Package, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";

const sections = [
  { label: "UTAMA", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
    { href: "/admin/chat", label: "Chat", icon: MessageCircle },
  ] },
  { label: "TOKO", items: [
    { href: "/admin/products", label: "Produk & stok", icon: Package },
    { href: "/admin/drops", label: "Drops", icon: Boxes },
    { href: "/admin/content", label: "CMS", icon: Images },
  ] },
  { label: "AKSES", items: [{ href: "/admin/staff", label: "Tim", icon: Users }] },
];

export function AdminNav({ mobile = false, role }: { mobile?: boolean; role?: string }) {
  const pathname = usePathname();
  return <nav aria-label="Navigasi admin" className="space-y-7">
    {sections.map((section) => {
      const items = section.items.filter((item) => item.href !== "/admin/staff" || role === "OWNER");
      if (!items.length) return null;
      return <div key={section.label}>
        <p className="mb-2 px-4 text-[10px] font-semibold tracking-[0.19em] text-white/35">{section.label}</p>
        <div className="space-y-0.5">{items.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const content = <><item.icon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden /><span>{item.label}</span>{active && <span className="ml-auto h-4 w-0.5 rounded-full bg-[#d8979b]" />}</>;
          const className = cn("flex h-11 items-center gap-3 rounded-md px-4 text-[13px] font-medium transition-colors", active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white");
          return mobile ? <SheetClose asChild key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link></SheetClose> : <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>;
        })}</div>
      </div>;
    })}
  </nav>;
}
