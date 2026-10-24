import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { auth } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Chat dengan Admin" };
export const dynamic = "force-dynamic";
export default async function CustomerChatPage({ searchParams }: { searchParams: Promise<{ produk?: string; order?: string }> }) {
  const sp = await searchParams;
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const initial = sp.produk ? `Halo admin, saya mau tanya soal produk ini: /products/${sp.produk.slice(0, 120)}` : sp.order ? `Halo admin, saya mau tanya soal pesanan ${sp.order.slice(0, 60)}` : "";
  return <div className="max-w-5xl"><ChatPanel endpoint="/api/chat" role="CUSTOMER" initialMessage={initial} /></div>;
}
