import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { PageHeading } from "@/components/admin/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Conversation = { id: string; customer_name: string; customer_email: string; updated_at: string; last_message: string | null };
export default async function AdminChatPage() {
  await requireAdmin();
  const { rows } = await getDb().query<Conversation>(`SELECT c.id,c.customer_name,c.customer_email,c.updated_at,(SELECT body FROM chat_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS last_message FROM chat_conversations c ORDER BY c.updated_at DESC LIMIT 100`);
  return <><PageHeading eyebrow="Layanan / Inbox" title="Percakapan pelanggan" description="Baca dan balas pertanyaan customer dari satu tempat." /><Card className="max-w-5xl gap-0 overflow-hidden border-line bg-white py-0 shadow-none"><CardHeader className="border-b border-line py-5"><CardTitle className="text-base">Semua percakapan</CardTitle><CardDescription>{rows.length} percakapan terbaru</CardDescription></CardHeader><CardContent className="px-0">{rows.map((row) => <Link key={row.id} href={`/admin/chat/${row.id}`} className="group flex items-center gap-4 border-b border-line px-5 py-4 last:border-b-0 hover:bg-muted/60 sm:px-6"><Avatar className="size-11"><AvatarFallback className="bg-brand/10 text-xs font-bold text-brand">{row.customer_name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm">{row.customer_name}</strong><small className="text-stone">{row.customer_email}</small></span><span className="mt-1 block truncate text-xs text-stone">{row.last_message || "Belum ada pesan"}</span></span><time className="hidden shrink-0 text-xs text-stone sm:block">{new Date(row.updated_at).toLocaleString("id-ID")}</time><ArrowUpRight className="size-4 shrink-0 text-stone group-hover:text-brand" /></Link>)}{rows.length === 0 && <div className="py-16 text-center"><MessageCircle className="mx-auto size-8 text-stone/40" /><p className="mt-3 text-sm font-medium">Inbox masih kosong</p><p className="mt-1 text-xs text-stone">Percakapan baru akan muncul di sini.</p></div>}</CardContent></Card></>;
}
