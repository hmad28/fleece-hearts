"use client";

import type { Drop, Product } from "@fh/types";
import { useState, type FormEvent } from "react";
import { ImageUpload } from "@/components/admin/image-upload";

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
  return <div className="grid gap-6 xl:grid-cols-[15rem_1fr]"><div className="space-y-2"><button onClick={() => { setSelected("__new"); setMessage(""); }} className="w-full rounded-xl bg-ink p-3 text-left text-paper">+ Drop baru</button>{drops.map((item) => <button key={item.id} onClick={() => { setSelected(item.id); setMessage(""); }} className={`w-full rounded-xl p-3 text-left ${selected === item.id ? "bg-ink text-paper" : "bg-mist"}`}>{item.code} · {item.name}</button>)}</div>{drop ? <form onSubmit={save} className="space-y-4 rounded-2xl border border-line p-5">{selected === "__new" && <label className="block text-sm">Slug URL<input value={drop.slug} onChange={(event) => update({ slug: event.target.value })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2" /></label>}{([ ["code", "Kode"], ["name", "Nama"], ["tagline", "Tagline"], ["description", "Deskripsi"] ] as const).map(([key,label]) => <label key={key} className="block text-sm">{label}<input value={drop[key] ?? ""} onChange={(event) => update({ [key]: event.target.value })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2" /></label>)}<label className="block text-sm">Rilis<input type="datetime-local" value={localDate(drop.releaseAt)} onChange={(event) => update({ releaseAt: new Date(event.target.value).toISOString() })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2" /></label><label className="block text-sm">Berakhir (opsional)<input type="datetime-local" value={drop.endAt ? localDate(drop.endAt) : ""} onChange={(event) => update({ endAt: event.target.value ? new Date(event.target.value).toISOString() : undefined })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2" /></label><label className="block text-sm">URL banner<input value={drop.banner.url ?? ""} onChange={(event) => update({ banner: { ...drop.banner, url: event.target.value } })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2" /></label><ImageUpload label="Upload banner drop" value={drop.banner.url ?? ""} onChange={(url) => update({ banner: { ...drop.banner, url } })} /><fieldset><legend className="text-sm font-semibold">Produk dalam drop</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{products.map((product) => <label key={product.id} className="flex gap-2 text-sm"><input type="checkbox" checked={drop.productIds.includes(product.id)} onChange={(event) => update({ productIds: event.target.checked ? [...drop.productIds, product.id] : drop.productIds.filter((id) => id !== product.id) })} />{product.name}</label>)}</div></fieldset><button className="rounded-full bg-ink px-6 py-3 text-paper">Simpan drop</button>{message && <p role="status">{message}</p>}</form> : <p>Belum ada drop.</p>}</div>;
}
