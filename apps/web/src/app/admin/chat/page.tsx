import Link from "next/link";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

type Conversation = { id: string; customer_name: string; customer_email: string; updated_at: string; last_message: string | null };

export default async function AdminChatPage() {
  await requireAdmin();
  const { rows } = await getDb().query<Conversation>(`SELECT c.id,c.customer_name,c.customer_email,c.updated_at,(SELECT body FROM chat_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS last_message FROM chat_conversations c ORDER BY c.updated_at DESC LIMIT 100`);
  return <><h1 className="font-display text-5xl">Inbox chat</h1><p className="mt-3 text-stone">Percakapan customer terbaru. Halaman ini memuat data saat dibuka.</p><div className="mt-8 divide-y divide-line rounded-2xl border border-line">{rows.map((row) => <Link key={row.id} href={`/admin/chat/${row.id}`} className="block px-5 py-5 hover:bg-mist"><div className="flex justify-between gap-4"><strong>{row.customer_name}</strong><time className="text-xs text-stone">{new Date(row.updated_at).toLocaleString("id-ID")}</time></div><p className="text-sm text-stone">{row.customer_email}</p><p className="mt-2 truncate text-sm">{row.last_message}</p></Link>)}{rows.length === 0 && <p className="p-5 text-stone">Belum ada percakapan.</p>}</div></>;
}
