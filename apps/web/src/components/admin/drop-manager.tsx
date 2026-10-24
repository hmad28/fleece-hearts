"use client";

import type { Drop, Product } from "@fh/types";
import { useState, type FormEvent } from "react";
import { Plus, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function localDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16); }

export function DropManager({ initial, products }: { initial: Drop[]; products: Product[] }) {
  const [drops, setDrops] = useState(initial);
  const [selected, setSelected] = useState(initial[0]?.id ?? "");
  const [draft, setDraft] = useState<Drop>({ id: "", slug: "", code: "", name: "", tagline: "", description: "", releaseAt: new Date(Date.now() + 86400000).toISOString(), productIds: [], banner: { id: "new_banner", url: null, alt: "" }, isDummy: false });
  const [message, setMessage] = useState("");
  const drop = selected === "__new" ? draft : drops.find((item) => item.id === selected);
  async function save(event: FormEvent) {
    event.preventDefault(); if (!drop) return; setMessage("");
    try {
      const creating = selected === "__new";
      const response = await fetch(creating ? "/api/admin/drops" : `/api/admin/drops/${drop.id}`, { method: creating ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: drop.slug, code: drop.code, name: drop.name, tagline: drop.tagline ?? "", description: drop.description ?? "", releaseAt: drop.releaseAt, endAt: drop.endAt ?? "", productIds: drop.productIds, bannerUrl: drop.banner.url ?? "" }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setDrops((items) => creating ? [...items, result] : items.map((item) => item.id === drop.id ? result : item)); setSelected(result.id); setMessage("Drop tersimpan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan drop."); }
  }
  function update(patch: Partial<Drop>) { if (selected === "__new") setDraft((value) => ({ ...value, ...patch })); else setDrops((items) => items.map((item) => item.id === selected ? { ...item, ...patch } : item)); }
  return <div className="space-y-5">
    {message && <p role="status" className="rounded-lg border border-brand/15 bg-brand/5 px-4 py-3 text-sm text-brand">{message}</p>}
    <div className="grid gap-5 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.5fr)]">
      <Card className="h-fit gap-0 border-line bg-white py-0 shadow-none"><CardHeader className="flex flex-row items-center justify-between border-b border-line py-5"><div><CardTitle className="text-base">Daftar drops</CardTitle><CardDescription className="mt-1">{drops.length} koleksi</CardDescription></div><Button type="button" size="sm" variant="brand" onClick={() => { setSelected("__new"); setMessage(""); }}><Plus className="size-4" /> Baru</Button></CardHeader><CardContent className="px-0">{drops.map((item) => <button type="button" key={item.id} onClick={() => { setSelected(item.id); setMessage(""); }} className={`flex w-full items-center justify-between gap-3 border-b border-line px-6 py-4 text-left last:border-b-0 hover:bg-muted/60 ${selected === item.id ? "bg-brand/5" : ""}`}><span><strong className="block text-sm">{item.name}</strong><small className="text-stone">{item.code} · {new Date(item.releaseAt).toLocaleDateString("id-ID")}</small></span><Badge tone="outline">{item.productIds.length} produk</Badge></button>)}{!drops.length && <p className="p-6 text-sm text-stone">Belum ada drop.</p>}</CardContent></Card>
      {drop ? <form onSubmit={save} className="space-y-5"><Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">{selected === "__new" ? "Buat drop" : "Edit drop"}</CardTitle><CardDescription>Identitas dan waktu rilis koleksi.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{selected === "__new" && <label className="text-xs font-semibold">Slug URL<Input value={drop.slug} placeholder="Contoh: essential-drop-01" onChange={(event) => update({ slug: event.target.value })} className="mt-1.5" /></label>}{([["code","Kode"],["name","Nama"],["tagline","Tagline"]] as const).map(([key,label]) => <label key={key} className="text-xs font-semibold">{label}<Input value={drop[key] ?? ""} placeholder={{ code: "Contoh: DROP 01", name: "Nama koleksi", tagline: "Kalimat singkat untuk koleksi" }[key]} onChange={(event) => update({ [key]: event.target.value })} className="mt-1.5" /></label>)}<label className="text-xs font-semibold sm:col-span-2">Deskripsi<Textarea value={drop.description ?? ""} placeholder="Ceritakan konsep dan produk dalam koleksi" onChange={(event) => update({ description: event.target.value })} className="mt-1.5" rows={4} /></label><label className="text-xs font-semibold">Rilis<Input type="datetime-local" value={localDate(drop.releaseAt)} onChange={(event) => update({ releaseAt: new Date(event.target.value).toISOString() })} className="mt-1.5" /></label><label className="text-xs font-semibold">Berakhir (opsional)<Input type="datetime-local" value={drop.endAt ? localDate(drop.endAt) : ""} onChange={(event) => update({ endAt: event.target.value ? new Date(event.target.value).toISOString() : undefined })} className="mt-1.5" /></label></CardContent></Card><Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Visual & produk</CardTitle><CardDescription>Banner dan produk yang masuk dalam drop.</CardDescription></CardHeader><CardContent className="space-y-4"><ImageUpload label="Upload banner drop" value={drop.banner.url ?? ""} onChange={(url) => update({ banner: { ...drop.banner, url } })} /><label className="block text-xs font-semibold">URL banner<Input value={drop.banner.url ?? ""} placeholder="https://.../banner.jpg" onChange={(event) => update({ banner: { ...drop.banner, url: event.target.value } })} className="mt-1.5" /></label><fieldset><legend className="mb-2 text-xs font-semibold">Produk dalam drop</legend><div className="grid max-h-72 gap-2 overflow-y-auto rounded-lg border border-line p-3 sm:grid-cols-2">{products.map((product) => <label key={product.id} className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-muted"><input type="checkbox" className="accent-brand" checked={drop.productIds.includes(product.id)} onChange={(event) => update({ productIds: event.target.checked ? [...drop.productIds, product.id] : drop.productIds.filter((id) => id !== product.id) })} />{product.name}</label>)}</div></fieldset><Button type="submit" variant="brand"><Save className="size-4" /> Simpan drop</Button></CardContent></Card></form> : <Card className="h-fit border-line bg-white shadow-none"><CardContent className="py-12 text-center text-sm text-stone">Pilih drop atau buat koleksi baru.</CardContent></Card>}
    </div>
  </div>;
}
