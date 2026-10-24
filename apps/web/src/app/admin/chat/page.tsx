import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Conversation = { id: string; customer_name: string; customer_email: string; updated_at: string; last_message: string | null };
export default async function AdminChatPage() {
  await requireAdmin();
  const { rows } = await getDb().query<Conversation>(`SELECT c.id,c.customer_name,c.customer_email,c.updated_at,(SELECT body FROM chat_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS last_message FROM chat_conversations c ORDER BY c.updated_at DESC LIMIT 100`);
  return <Card className="max-w-5xl gap-0 overflow-hidden rounded-none border-[#e6e1d9] bg-white py-0 shadow-none"><CardHeader className="flex h-14 flex-row items-center justify-between border-b border-[#e6e1d9] px-5"><CardTitle className="text-sm">Inbox</CardTitle><span className="text-xs text-stone">{rows.length}</span></CardHeader><CardContent className="px-0">{rows.map((row) => <Link key={row.id} href={`/admin/chat/${row.id}`} className="group flex items-center gap-4 border-b border-[#eee9e2] px-5 py-4 last:border-b-0 hover:bg-[#faf7f3]"><Avatar className="size-10 rounded-md"><AvatarFallback className="rounded-md bg-[#eee4df] text-xs font-bold text-brand">{row.customer_name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm">{row.customer_name}</strong><small className="text-stone">{row.customer_email}</small></span><span className="mt-1 block truncate text-xs text-stone">{row.last_message || "Belum ada pesan"}</span></span><time className="hidden shrink-0 text-xs text-stone sm:block">{new Date(row.updated_at).toLocaleString("id-ID")}</time><ArrowUpRight className="size-4 shrink-0 text-stone group-hover:text-brand" /></Link>)}{rows.length === 0 && <div className="py-16 text-center"><MessageCircle className="mx-auto size-7 text-stone/40" /><p className="mt-3 text-sm text-stone">Belum ada percakapan.</p></div>}</CardContent></Card>;
}
