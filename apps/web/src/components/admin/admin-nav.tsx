"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const items = [
  { href: "/admin", label: "Ringkasan", number: "01" },
  { href: "/admin/products", label: "Produk & stok", number: "02" },
  { href: "/admin/drops", label: "Drops", number: "03" },
  { href: "/admin/orders", label: "Pesanan", number: "04" },
  { href: "/admin/content", label: "Konten situs", number: "05" },
  { href: "/admin/chat", label: "Inbox chat", number: "06" },
  { href: "/admin/staff", label: "Staf", number: "07" },
];

export function AdminNav() {
  const pathname = usePathname();
  return <nav aria-label="Navigasi admin" className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-5 lg:pb-0">
    {items.map((item) => {
      const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`group flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors lg:w-full ${active ? "bg-brand text-paper" : "text-ink hover:bg-paper"}`}>
        <span className={`text-[0.65rem] font-semibold tabular tracking-wide ${active ? "text-paper/65" : "text-stone"}`}>{item.number}</span>
        <span className="font-medium">{item.label}</span>
        <ArrowUpRight className={`ml-auto size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} aria-hidden />
      </Link>;
    })}
  </nav>;
}
