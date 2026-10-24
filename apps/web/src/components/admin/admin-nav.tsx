"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Images, LayoutDashboard, MessageCircle, Package, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";

const groups = [
  { label: "Workspace", items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
    { href: "/admin/chat", label: "Inbox chat", icon: MessageCircle },
  ] },
  { label: "Katalog & konten", items: [
    { href: "/admin/products", label: "Produk & stok", icon: Package },
    { href: "/admin/drops", label: "Drops", icon: Boxes },
    { href: "/admin/content", label: "CMS toko", icon: Images },
  ] },
  { label: "Pengaturan", items: [
    { href: "/admin/staff", label: "Tim & akses", icon: Users },
  ] },
];

export function AdminNav({ mobile = false, role }: { mobile?: boolean; role?: string }) {
  const pathname = usePathname();
  return <nav aria-label="Navigasi admin" className="space-y-7">
    {groups.map((group) => {
      const items = group.items.filter((item) => item.href !== "/admin/staff" || role === "OWNER");
      if (!items.length) return null;
      return <div key={group.label}>
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">{group.label}</p>
        <div className="space-y-1">{items.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const content = <><item.icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden /><span>{item.label}</span>{active && <span className="ml-auto size-1.5 rounded-full bg-brand" />}</>;
          const className = cn("flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-brand/8 text-brand" : "text-ink/75 hover:bg-mist hover:text-ink");
          return mobile
            ? <SheetClose asChild key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link></SheetClose>
            : <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>;
        })}</div>
      </div>;
    })}
  </nav>;
}
