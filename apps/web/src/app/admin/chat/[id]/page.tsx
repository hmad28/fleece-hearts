import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { PageHeading } from "@/components/admin/page-heading";

export default async function AdminConversationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { rows } = await getDb().query<{ customer_name: string; customer_email: string }>("SELECT customer_name,customer_email FROM chat_conversations WHERE id=$1", [id]);
  if (!rows[0]) notFound();
  return <div className="max-w-5xl"><Link href="/admin/chat" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"><ArrowLeft className="size-4" /> Kembali ke inbox</Link><PageHeading eyebrow="Layanan / Percakapan" title={rows[0].customer_name} description={rows[0].customer_email} /><ChatPanel endpoint={`/api/admin/chat/${id}`} role="ADMIN" /></div>;
}
