import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminConversationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { rows } = await getDb().query<{ customer_name: string; customer_email: string }>("SELECT customer_name,customer_email FROM chat_conversations WHERE id=$1", [id]);
  if (!rows[0]) notFound();
  return <div className="max-w-5xl"><Link href="/admin/chat" className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-brand hover:underline"><ArrowLeft className="size-4" /> Inbox</Link><div className="mb-4 flex items-center justify-between border border-[#e6e1d9] bg-white px-5 py-3"><span className="text-sm font-semibold">{rows[0].customer_name}</span><span className="text-xs text-stone">{rows[0].customer_email}</span></div><ChatPanel endpoint={`/api/admin/chat/${id}`} role="ADMIN" /></div>;
}
