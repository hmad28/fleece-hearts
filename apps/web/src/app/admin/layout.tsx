import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/products", label: "Produk & stok" },
  { href: "/admin/drops", label: "Drops" },
  { href: "/admin/orders", label: "Pesanan demo" },
  { href: "/admin/content", label: "CMS" },
  { href: "/admin/chat", label: "Inbox chat" },
  { href: "/admin/staff", label: "Staf" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const admin = await getAdminUser();
  if (!admin) return <div className="mx-auto max-w-2xl px-6 py-24"><h1 className="font-display text-5xl">Akses ditolak</h1><p className="mt-5">Akun ini belum terdaftar sebagai staf, atau email akun belum terverifikasi.</p><Link href="/account" className="mt-6 inline-block underline">Kembali ke akun</Link></div>;
  return <div className="min-h-screen bg-paper text-ink">
    <header className="border-b border-line px-5 py-5 md:px-10"><div className="mx-auto flex max-w-[90rem] items-center justify-between"><Link href="/admin" className="font-display text-2xl">Fleece Hearts / Admin</Link><div className="text-sm"><span className="hidden sm:inline">{admin.email} · </span><Link href="/" className="underline">Lihat toko</Link></div></div></header>
    <div className="mx-auto grid max-w-[90rem] md:grid-cols-[14rem_minmax(0,1fr)]">
      <nav aria-label="Navigasi admin" className="flex gap-2 overflow-x-auto border-b border-line px-4 py-3 text-sm md:min-h-[calc(100vh-5rem)] md:flex-col md:border-r md:border-b-0 md:px-6 md:py-8">{nav.map((item) => <Link key={item.href} href={item.href} className="shrink-0 rounded-lg px-3 py-2 hover:bg-mist">{item.label}</Link>)}</nav>
      <main className="min-w-0 px-4 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  </div>;
}
