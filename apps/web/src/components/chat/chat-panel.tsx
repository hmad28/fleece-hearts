"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Message = { id: number; sender_role: "ADMIN" | "CUSTOMER"; body: string; created_at: string };
export function ChatPanel({ endpoint, role, initialMessage = "" }: { endpoint: string; role: "ADMIN" | "CUSTOMER"; initialMessage?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState(initialMessage);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottom = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error("Percakapan gagal dimuat");
      setMessages((await response.json()).messages);
      setError("");
    } catch { setError("Percakapan gagal dimuat. Coba segarkan halaman."); }
    finally { setLoading(false); }
  }, [endpoint]);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 5000); return () => window.clearInterval(timer); }, [load]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length]);
  async function send(event: FormEvent) {
    event.preventDefault(); if (!body.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      if (!response.ok) throw new Error("Gagal mengirim");
      setBody(""); await load();
    } catch { setError("Pesan gagal dikirim. Coba lagi."); }
    finally { setBusy(false); }
  }
  return <Card className="gap-0 overflow-hidden border-line bg-white py-0 shadow-none" aria-label="Percakapan">
    <div className="flex items-center gap-3 border-b border-line px-5 py-4"><span className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand"><MessageCircle className="size-5" /></span><div><strong className="block text-sm">{role === "ADMIN" ? "Percakapan customer" : "Tim Fleece Hearts"}</strong><small className="text-stone">Balasan diperbarui otomatis setiap 5 detik</small></div></div>
    <div className="h-[min(60vh,36rem)] space-y-5 overflow-y-auto bg-[#faf9f7] px-4 py-6 sm:px-7" aria-live="polite">
      {loading && <p className="text-center text-sm text-stone">Memuat percakapan...</p>}
      {!loading && messages.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center"><span className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"><MessageCircle className="size-6" /></span><strong className="mt-4 text-sm">Mulai percakapan</strong><p className="mt-1 max-w-xs text-xs leading-5 text-stone">{role === "ADMIN" ? "Belum ada pesan dari customer ini." : "Tanya tentang produk, ukuran, atau pesanan. Tim kami akan membalas di sini."}</p></div>}
      {messages.map((message) => {
        const own = message.sender_role === role;
        return <div key={message.id} className={`flex gap-2.5 ${own ? "justify-end" : "justify-start"}`}>{!own && <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-brand/10 text-[10px] font-bold text-brand">{role === "ADMIN" ? "CU" : "FH"}</AvatarFallback></Avatar>}<div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[72%] ${own ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm border border-line bg-white text-ink"}`}><p className="whitespace-pre-wrap break-words leading-6">{message.body}</p><time className={`mt-2 block text-[10px] ${own ? "text-white/70" : "text-stone"}`} dateTime={message.created_at}>{new Date(message.created_at).toLocaleString("id-ID")}</time></div></div>;
      })}
      <div ref={bottom} />
    </div>
    <form onSubmit={send} className="flex items-end gap-2 border-t border-line p-4 sm:p-5"><label className="sr-only" htmlFor="chat-message">Pesan</label><Textarea id="chat-message" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} rows={2} placeholder="Tulis pesan..." className="min-h-12 flex-1 resize-none" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><Button type="submit" disabled={busy || !body.trim()} variant="brand" size="icon" className="shrink-0 rounded-lg" aria-label="Kirim pesan"><Send className="size-4" /></Button></form>
    {error && <p role="alert" className="px-5 pb-4 text-xs text-danger">{error}</p>}
  </Card>;
}
