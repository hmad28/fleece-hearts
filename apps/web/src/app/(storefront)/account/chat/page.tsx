import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { auth } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Chat dengan Admin" };
export const dynamic = "force-dynamic";

export default async function CustomerChatPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  return <main className="mx-auto max-w-3xl px-4 py-16"><Link href="/account" className="text-sm underline">← Akun saya</Link><h1 className="font-display my-8 text-5xl">Chat dengan admin</h1><ChatPanel endpoint="/api/chat" role="CUSTOMER" /></main>;
}
