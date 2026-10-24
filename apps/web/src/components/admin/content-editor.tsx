"use client";

import { useState, type FormEvent } from "react";
import { Eye, Image as ImageIcon, Link2, Save, Type } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";
import { ImageUpload } from "./image-upload";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const sections = [["showLatest", "Produk terbaru", "Rangkaian produk terbaru di beranda"], ["showLookbook", "Lookbook", "Editorial dan inspirasi tampilan"], ["showMaterial", "Cerita material", "Informasi bahan dan kualitas"], ["showCategories", "Kategori", "Navigasi berdasarkan jenis produk"]] as const;
  return <form onSubmit={save} className="space-y-5">
    {message && <p role="status" className="rounded-lg border border-brand/15 bg-brand/5 px-4 py-3 text-sm text-brand">{message}</p>}
    <Tabs defaultValue="promotion" className="space-y-5"><div className="max-w-full overflow-x-auto"><TabsList className="bg-mist/70"><TabsTrigger value="promotion"><ImageIcon className="mr-1.5 size-4" /> Promosi</TabsTrigger><TabsTrigger value="copy"><Type className="mr-1.5 size-4" /> Teks beranda</TabsTrigger><TabsTrigger value="sections"><Eye className="mr-1.5 size-4" /> Bagian halaman</TabsTrigger><TabsTrigger value="contact"><Link2 className="mr-1.5 size-4" /> Kontak</TabsTrigger></TabsList></div>
      <TabsContent value="promotion"><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]"><Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Popup promosi</CardTitle><CardDescription>Gambar ini muncul saat pengunjung membuka situs. Hanya gambar yang tampil.</CardDescription></CardHeader><CardContent className="space-y-5"><label className="flex items-center justify-between gap-4 rounded-lg border border-line p-4"><span><strong className="block text-sm">Aktifkan popup</strong><small className="text-stone">Tampilkan gambar promosi kepada pengunjung</small></span><Switch checked={value.promotionEnabled} onCheckedChange={(checked) => setValue({ ...value, promotionEnabled: checked })} aria-label="Aktifkan popup promosi" /></label><ImageUpload value={value.promotionImageUrl} onChange={(url) => setValue({ ...value, promotionImageUrl: url })} label="Gambar promosi" /></CardContent></Card><Card className="h-fit border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Pratinjau</CardTitle><CardDescription>Tampilan gambar sebelum diterbitkan</CardDescription></CardHeader><CardContent>{value.promotionImageUrl ? <div className="overflow-hidden rounded-lg border border-line bg-mist"><img src={value.promotionImageUrl} alt="Pratinjau promosi" className="aspect-[4/5] w-full object-cover" /></div> : <div className="flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-line bg-muted text-sm text-stone">Belum ada gambar</div>}</CardContent></Card></div></TabsContent>
      <TabsContent value="copy"><Card className="max-w-3xl border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Teks beranda</CardTitle><CardDescription>Salinan yang tampil di bagian pengumuman dan hero situs.</CardDescription></CardHeader><CardContent className="space-y-5">{([["announcement", "Pengumuman", 2], ["heroEyebrow", "Label hero", 2], ["heroBody", "Teks hero", 5]] as const).map(([key,label,rows]) => <label key={key} className="block text-xs font-semibold">{label}<Textarea value={value[key]} placeholder={{ announcement: "Info rilis atau promo terbaru", heroEyebrow: "Contoh: Fleece Hearts / Drop 01", heroBody: "Ceritakan pesan utama di halaman depan" }[key]} onChange={(event) => setValue({ ...value, [key]: event.target.value })} rows={rows} className="mt-2" /></label>)}</CardContent></Card></TabsContent>
      <TabsContent value="sections"><Card className="max-w-3xl border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Bagian yang tampil</CardTitle><CardDescription>Atur susunan konten beranda tanpa mengubah kode.</CardDescription></CardHeader><CardContent className="divide-y divide-line">{sections.map(([key,label,description]) => <label key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><span><strong className="block text-sm">{label}</strong><small className="text-stone">{description}</small></span><Switch checked={value[key]} onCheckedChange={(checked) => setValue({ ...value, [key]: checked })} aria-label={label} /></label>)}</CardContent></Card></TabsContent>
      <TabsContent value="contact"><div className="max-w-3xl space-y-5">
        <Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Identitas Fleece Hearts</CardTitle></CardHeader><CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-4"><span className="inline-flex items-center rounded-xl bg-brand px-5 py-4 text-white"><Wordmark /></span><span className="text-sm text-stone">Maroon #8B000B · Helvetica</span></div>
          <label className="block text-xs font-semibold">Deskripsi singkat<Textarea value={value.description} onChange={(event) => setValue({ ...value, description: event.target.value })} placeholder="Ceritakan Fleece Hearts dalam satu atau dua kalimat" rows={3} className="mt-1.5" /></label>
          <label className="block text-xs font-semibold">Lokasi toko<Input value={value.location} onChange={(event) => setValue({ ...value, location: event.target.value })} placeholder="Isi lokasi toko saat sudah dikonfirmasi" className="mt-1.5" /></label>
        </CardContent></Card>
        <Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Kontak & sosial</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold">Email kontak<Input type="email" value={value.contactEmail} onChange={(event) => setValue({ ...value, contactEmail: event.target.value })} placeholder="fleecehearts@gmail.com" className="mt-1.5" /></label>
          <label className="block text-xs font-semibold">Nomor WhatsApp<Input type="tel" value={value.whatsappNumber} onChange={(event) => setValue({ ...value, whatsappNumber: event.target.value })} placeholder="+62 878-8366-6572" className="mt-1.5" /></label>
          <label className="block text-xs font-semibold">URL Instagram<Input type="url" value={value.instagramUrl} onChange={(event) => setValue({ ...value, instagramUrl: event.target.value })} placeholder="https://www.instagram.com/..." className="mt-1.5" /></label>
          <label className="block text-xs font-semibold">URL TikTok<Input type="url" value={value.tiktokUrl} onChange={(event) => setValue({ ...value, tiktokUrl: event.target.value })} placeholder="https://www.tiktok.com/@..." className="mt-1.5" /></label>
        </CardContent></Card>
      </div></TabsContent>
    </Tabs>
    <div className="sticky bottom-4 z-10 flex justify-end"><Button type="submit" disabled={busy} variant="brand" className="shadow-lg"><Save className="size-4" />{busy ? "Menyimpan..." : "Simpan konten"}</Button></div>
  </form>;
}
