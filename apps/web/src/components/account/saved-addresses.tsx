"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Address = { id?: string; label: string; recipientName: string; phone: string; province: string; city: string; district: string; postalCode: string; line1: string; isDefault: boolean };
const blank: Address = { label: "Rumah", recipientName: "", phone: "", province: "", city: "", district: "", postalCode: "", line1: "", isDefault: false };
const fields: { key: keyof Pick<Address, "recipientName" | "phone" | "province" | "city" | "district" | "postalCode" | "line1">; label: string; placeholder: string; wide?: boolean }[] = [
  { key: "recipientName", label: "Nama penerima", placeholder: "Nama lengkap penerima" },
  { key: "phone", label: "Nomor HP", placeholder: "08xxxxxxxxxx" },
  { key: "province", label: "Provinsi", placeholder: "Contoh: Jawa Barat" },
  { key: "city", label: "Kota / kabupaten", placeholder: "Contoh: Kabupaten Bogor" },
  { key: "district", label: "Kecamatan", placeholder: "Contoh: Cileungsi" },
  { key: "postalCode", label: "Kode pos", placeholder: "Contoh: 16820" },
  { key: "line1", label: "Alamat lengkap", placeholder: "Jalan, nomor rumah, RT/RW, dan patokan", wide: true },
];

export function SavedAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function reload() {
    const response = await fetch("/api/account/addresses");
    if (!response.ok) throw new Error("Alamat gagal dimuat");
    const result = await response.json();
    setAddresses(result.addresses);
  }
  useEffect(() => { let active = true; fetch("/api/account/addresses").then((response) => response.ok ? response.json() : Promise.reject()).then((result) => { if (active) setAddresses(result.addresses); }).catch(() => { if (active) setMessage("Alamat belum dapat dimuat."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/account/addresses", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!response.ok) throw new Error((await response.json()).error ?? "Alamat gagal disimpan");
      await reload(); setEditing(null); setMessage("Alamat berhasil disimpan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Alamat gagal disimpan."); }
    finally { setBusy(false); }
  }
  async function makeDefault(address: Address) {
    setBusy(true); setMessage("");
    try { const response = await fetch("/api/account/addresses", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...address, isDefault: true }) }); if (!response.ok) throw new Error("Alamat utama gagal diubah"); await reload(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Gagal mengubah alamat utama."); }
    finally { setBusy(false); }
  }
  async function remove(address: Address) {
    if (!address.id || !window.confirm(`Hapus alamat ${address.label}?`)) return;
    setBusy(true); setMessage("");
    try { const response = await fetch(`/api/account/addresses?id=${encodeURIComponent(address.id)}`, { method: "DELETE" }); if (!response.ok) throw new Error("Alamat gagal dihapus"); await reload(); if (editing?.id === address.id) setEditing(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Alamat gagal dihapus."); }
    finally { setBusy(false); }
  }

  if (loading) return <div aria-busy="true" className="grid gap-4 md:grid-cols-2">{Array.from({ length: 2 }, (_, index) => <div key={index} className="space-y-5 rounded-[22px] border border-[#e9e2dc] bg-white p-6"><Skeleton className="h-5 w-32" /><Skeleton className="h-20 w-full" /></div>)}</div>;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-stone">Alamat utama otomatis terisi saat checkout.</p><Button type="button" variant="brand" onClick={() => setEditing({ ...blank })}><Plus className="size-4" /> Tambah alamat</Button></div>
    {message && <p role="status" className="text-sm text-brand">{message}</p>}
    <div className="grid gap-4 lg:grid-cols-2">{addresses.map((address) => <article key={address.id} className="flex min-h-56 flex-col justify-between rounded-[22px] border border-[#e9e2dc] bg-white p-5 sm:p-6"><div><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><MapPin className="size-5 text-brand" /><h2 className="font-semibold">{address.label}</h2></div>{address.isDefault && <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">Utama</span>}</div><p className="mt-5 font-medium">{address.recipientName} · {address.phone}</p><p className="mt-2 text-sm leading-6 text-stone">{address.line1}<br />{address.district}, {address.city}, {address.province} {address.postalCode}</p></div><div className="mt-6 flex flex-wrap items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setEditing({ ...address })}><Pencil className="size-4" /> Edit</Button>{!address.isDefault && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void makeDefault(address)}><Star className="size-4" /> Jadikan utama</Button>}<Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void remove(address)} className="text-danger"><Trash2 className="size-4" /> Hapus</Button></div></article>)}{addresses.length === 0 && <div className="rounded-[22px] border border-dashed border-[#dcd3cb] bg-white p-10 text-center text-sm text-stone">Belum ada alamat tersimpan.</div>}</div>
    {editing && <form onSubmit={save} className="space-y-5 rounded-[22px] border border-[#e9e2dc] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><h2 className="text-[1.1rem] font-semibold">{editing.id ? "Edit alamat" : "Alamat baru"}</h2><button type="button" onClick={() => setEditing(null)} className="text-sm text-stone hover:text-brand">Batal</button></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Label alamat<Input required value={editing.label} onChange={(event) => setEditing({ ...editing, label: event.target.value })} placeholder="Rumah atau Kantor" className="mt-2" /></label>{fields.map((field) => <label key={field.key} className={`text-sm font-medium ${field.wide ? "sm:col-span-2" : ""}`}>{field.label}<Input required value={editing[field.key]} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })} placeholder={field.placeholder} className="mt-2" /></label>)}</div>{editing.id && addresses.find((address) => address.id === editing.id)?.isDefault ? <p className="text-sm text-stone">Alamat ini sedang menjadi alamat utama. Pilih alamat lain sebagai utama untuk menggantinya.</p> : <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.isDefault} onChange={(event) => setEditing({ ...editing, isDefault: event.target.checked })} className="accent-brand" /> Jadikan alamat utama</label>}<Button type="submit" variant="brand" disabled={busy}>{busy ? "Menyimpan..." : "Simpan alamat"}</Button></form>}
  </div>;
}
