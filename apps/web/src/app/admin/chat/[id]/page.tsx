import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminConversationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { rows } = await getDb().query<{ customer_name: string; customer_email: string }>("SELECT customer_name,customer_email FROM chat_conversations WHERE id=$1", [id]);
  if (!rows[0]) notFound();
  return <><Link href="/admin/chat" className="text-sm underline">← Inbox</Link><h1 className="font-display mt-7 text-5xl">{rows[0].customer_name}</h1><p className="my-6 text-stone">{rows[0].customer_email}</p><ChatPanel endpoint={`/api/admin/chat/${id}`} role="ADMIN" /></>;
}
