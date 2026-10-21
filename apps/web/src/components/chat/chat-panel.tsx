"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Message = { id: number; sender_role: "ADMIN" | "CUSTOMER"; body: string; created_at: string };

export function ChatPanel({ endpoint, role, initialMessage = "" }: { endpoint: string; role: "ADMIN" | "CUSTOMER"; initialMessage?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState(initialMessage);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error("Percakapan gagal dimuat");
      setMessages((await response.json()).messages);
      setError("");
    } catch { setError("Percakapan gagal dimuat. Coba segarkan halaman."); }
  }, [endpoint]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      if (!response.ok) throw new Error("Gagal mengirim");
      setBody("");
      await load();
    } catch { setError("Pesan gagal dikirim. Coba lagi."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-2xl border border-line bg-paper p-4 md:p-6" aria-label="Percakapan">
    <div className="h-96 space-y-3 overflow-y-auto" aria-live="polite">
      {messages.length === 0 && <p className="text-stone">Belum ada pesan. Tulis pertanyaan untuk memulai percakapan.</p>}
      {messages.map((message) => <div key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender_role === role ? "ml-auto bg-ink text-paper" : "bg-mist text-ink"}`}>
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <time className="mt-2 block text-xs opacity-70" dateTime={message.created_at}>{new Date(message.created_at).toLocaleString("id-ID")}</time>
      </div>)}
    </div>
    <form onSubmit={send} className="mt-5 flex gap-2 border-t border-line pt-5">
      <label className="sr-only" htmlFor="chat-message">Pesan</label>
      <input id="chat-message" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="Tulis pesan…" className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-3" />
      <button disabled={busy || !body.trim()} className="rounded-xl bg-ink px-5 py-3 text-paper disabled:opacity-50">Kirim</button>
    </form>
    {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    <p className="mt-3 text-xs text-stone">Pesan disimpan di server dan dapat dibaca oleh tim toko. Balasan diperbarui setiap 5 detik.</p>
  </section>;
}
