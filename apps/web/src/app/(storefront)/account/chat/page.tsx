import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { auth } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Chat dengan Admin" };
export const dynamic = "force-dynamic";
export default async function CustomerChatPage({ searchParams }: { searchParams: Promise<{ produk?: string; order?: string }> }) {
  const sp = await searchParams;
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const initial = sp.produk ? `Halo admin, saya mau tanya soal produk ini: /products/${sp.produk.slice(0, 120)}` : sp.order ? `Halo admin, saya mau tanya soal pesanan ${sp.order.slice(0, 60)}` : "";
  return <main className="min-h-[70vh] bg-[#f8f7f4] px-4 py-10 sm:px-7 lg:py-14"><div className="mx-auto max-w-4xl"><Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"><ArrowLeft className="size-4" /> Kembali ke akun</Link><div className="mb-7 mt-6"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-brand">Akun / Bantuan</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Chat dengan admin</h1><p className="mt-2 text-sm text-stone">Tanya soal ukuran, produk, atau pesananmu.</p></div><ChatPanel endpoint="/api/chat" role="CUSTOMER" initialMessage={initial} /></div></main>;
}
