"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    } catch { setError("Percakapan gagal dimuat."); }
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
    } catch { setError("Pesan gagal dikirim."); }
    finally { setBusy(false); }
  }
  return <section className="flex min-h-[520px] flex-col border border-[#e6e1d9] bg-white" aria-label="Percakapan">
    <div className="flex h-12 items-center justify-between border-b border-[#e6e1d9] px-5"><span className="text-xs font-semibold">Pesan</span><span className="text-[11px] text-stone">Diperbarui otomatis</span></div>
    <div className="h-[min(55vh,36rem)] flex-1 space-y-4 overflow-y-auto bg-[#faf9f6] px-4 py-6 sm:px-6" aria-live="polite">
      {loading && <div aria-busy="true" aria-label="Memuat percakapan" className="space-y-4"><Skeleton className="h-16 w-2/3 rounded-2xl" /><Skeleton className="ml-auto h-14 w-1/2 rounded-2xl" /><Skeleton className="h-20 w-3/5 rounded-2xl" /></div>}
      {!loading && messages.length === 0 && <div className="flex h-full items-center justify-center text-sm text-stone">Belum ada pesan.</div>}
      {messages.map((message) => {
        const own = message.sender_role === role;
        return <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] px-4 py-3 text-sm sm:max-w-[70%] ${own ? "bg-brand text-white" : "border border-[#e6e1d9] bg-white"}`}><p className="whitespace-pre-wrap break-words leading-6">{message.body}</p><time className={`mt-1.5 block text-[10px] ${own ? "text-white/65" : "text-stone"}`} dateTime={message.created_at}>{new Date(message.created_at).toLocaleString("id-ID")}</time></div></div>;
      })}
      <div ref={bottom} />
    </div>
    <form onSubmit={send} className="flex items-end gap-2 border-t border-[#e6e1d9] p-3 sm:p-4"><label className="sr-only" htmlFor="chat-message">Pesan</label><Textarea id="chat-message" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} rows={2} placeholder="Tulis pesan..." className="min-h-12 flex-1 resize-none rounded-md border-[#ded8d0] bg-[#fdfcf9] shadow-none" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><Button type="submit" disabled={busy || !body.trim()} variant="brand" size="icon" className="shrink-0 rounded-md" aria-label="Kirim pesan"><Send className="size-4" /></Button></form>
    {error && <p role="alert" className="px-4 pb-3 text-xs text-danger">{error}</p>}
  </section>;
}
