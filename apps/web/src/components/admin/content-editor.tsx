"use client";

import { useState, type FormEvent } from "react";
import type { SiteContent } from "@/lib/site-content";
import { ImageUpload } from "./image-upload";

export function ContentEditor({ initial }: { initial: SiteContent }) {
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
      if (!response.ok) throw new Error((await response.json()).error);
      setMessage("Konten tersimpan dan langsung tampil di toko.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan konten."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="max-w-2xl space-y-5 rounded-2xl border border-line p-6">
    <div className="space-y-4 border-b border-line pb-6">
      <h2 className="font-display text-3xl">Popup promosi</h2>
      <p className="text-sm text-stone">Hanya gambar yang tampil saat pengunjung membuka toko. Ganti gambar demo dengan materi promosi resmi.</p>
      <label className="flex gap-3 text-sm"><input type="checkbox" checked={value.promotionEnabled} onChange={(event) => setValue({ ...value, promotionEnabled: event.target.checked })} />Aktifkan popup promosi</label>
      <ImageUpload value={value.promotionImageUrl} onChange={(url) => setValue({ ...value, promotionImageUrl: url })} label="Gambar promosi" />
    </div>
    {([ ["announcement", "Pengumuman"], ["heroEyebrow", "Label hero"], ["heroBody", "Teks hero"] ] as const).map(([key,label]) => <label key={key} className="block text-sm">{label}<textarea value={value[key]} onChange={(event) => setValue({ ...value, [key]: event.target.value })} rows={key === "heroBody" ? 4 : 2} className="mt-2 w-full rounded-xl border border-line bg-paper p-3" /></label>)}
    {([ ["showLatest", "Produk terbaru"], ["showLookbook", "Lookbook"], ["showMaterial", "Cerita material"], ["showCategories", "Kategori"] ] as const).map(([key,label]) => <label key={key} className="flex gap-3 text-sm"><input type="checkbox" checked={value[key]} onChange={(event) => setValue({ ...value, [key]: event.target.checked })} />{label}</label>)}
    <button disabled={busy} className="rounded-full bg-ink px-7 py-3 text-paper disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan konten"}</button>{message && <p role="status">{message}</p>}
  </form>;
}
