"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Pesanan",
  "/admin/products": "Produk & stok",
  "/admin/drops": "Drops",
  "/admin/content": "CMS",
  "/admin/chat": "Chat pelanggan",
  "/admin/staff": "Tim & akses",
};

export function AdminHeaderTitle() {
  const pathname = usePathname();
  const title = titles[pathname] ?? (pathname.startsWith("/admin/chat/") ? "Percakapan" : "Dashboard");
  return <h1 className="truncate text-xl font-semibold tracking-[-0.035em] text-[#24201e] sm:text-2xl">{title}</h1>;
}
