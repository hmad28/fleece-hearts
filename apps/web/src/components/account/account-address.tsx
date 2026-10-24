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
  return <section id="alamat" className="border border-[#e6e1d9] bg-white"><div className="flex h-14 items-center border-b border-[#e6e1d9] px-5"><h2 className="text-sm font-semibold">Alamat utama</h2></div><div className="p-5">{loading ? <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div> : <form onSubmit={save} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{fields.map(({ key, label, autoComplete, inputMode, wide }) => <label key={key} className={`block text-xs font-medium ${wide ? "sm:col-span-2" : ""}`}>{label}<Input value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} autoComplete={autoComplete} inputMode={inputMode} required className="mt-1.5 h-10 rounded-md border-[#ded8d0] bg-[#fdfcf9] shadow-none" /></label>)}</div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={busy} variant="brand" size="sm" className="rounded-md">{busy ? "Menyimpan..." : "Simpan alamat"}</Button>{message && <p role="status" className={`text-xs ${error ? "text-danger" : "text-brand"}`}>{message}</p>}</div></form>}</div></section>;
}
