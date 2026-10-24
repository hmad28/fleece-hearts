"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Address = { recipientName: string; phone: string; province: string; city: string; district: string; postalCode: string; line1: string };
const blank: Address = { recipientName: "", phone: "", province: "", city: "", district: "", postalCode: "", line1: "" };
const fields: { key: keyof Address; label: string; autoComplete?: string; inputMode?: "text" | "tel" | "numeric"; wide?: boolean }[] = [
  { key: "recipientName", label: "Nama penerima", autoComplete: "name" }, { key: "phone", label: "Nomor HP", autoComplete: "tel", inputMode: "tel" },
  { key: "province", label: "Provinsi", autoComplete: "address-level1" }, { key: "city", label: "Kota / kabupaten", autoComplete: "address-level2" },
  { key: "district", label: "Kecamatan", autoComplete: "address-level3" }, { key: "postalCode", label: "Kode pos", autoComplete: "postal-code", inputMode: "numeric" },
  { key: "line1", label: "Alamat lengkap", autoComplete: "street-address", wide: true },
];
export function AccountAddress() {
  const [address, setAddress] = useState<Address>(blank);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/account/address").then((res) => { if (!res.ok) throw new Error("Alamat belum dapat dimuat."); return res.json(); })
      .then((data) => { if (active && data?.address) setAddress(data.address); })
      .catch(() => { if (active) { setError(true); setMessage("Alamat belum dapat dimuat."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/account/address", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(address) });
      setError(!res.ok); setMessage(res.ok ? "Alamat tersimpan." : "Alamat gagal disimpan. Periksa kembali isian.");
    } catch { setError(true); setMessage("Alamat gagal disimpan."); }
    finally { setBusy(false); }
  }
  return <section id="alamat" className="w-full overflow-hidden rounded-[28px] border border-[#e8e0d8] bg-white shadow-[0_18px_55px_-45px_rgba(65,30,30,0.38)]"><div className="flex min-h-20 items-center border-b border-[#eee8e0] px-6 sm:px-8"><h2 className="text-xl font-semibold tracking-tight">Alamat utama</h2></div><div className="p-6 sm:p-8">{loading ? <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-12 w-full rounded-xl" />)}</div> : <form onSubmit={save} className="space-y-7"><div className="grid gap-5 sm:grid-cols-2">{fields.map(({ key, label, autoComplete, inputMode, wide }) => <label key={key} className={`block text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>{label}<Input value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} autoComplete={autoComplete} inputMode={inputMode} required className="mt-2 h-12 rounded-xl border-[#ded8d0] bg-[#fdfcf9] px-4 text-base shadow-none" /></label>)}</div><div className="flex flex-wrap items-center gap-4"><Button type="submit" disabled={busy} variant="brand" size="md" className="rounded-xl px-7">{busy ? "Menyimpan..." : "Simpan alamat"}</Button>{message && <p role="status" className={`text-sm ${error ? "text-danger" : "text-brand"}`}>{message}</p>}</div></form>}</div></section>;
}
