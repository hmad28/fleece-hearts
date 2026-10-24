"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LogOut, MapPin, Save, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
export function AccountAddress({ name, email }: { name: string; email: string }) {
  const router = useRouter();
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
      setError(!res.ok); setMessage(res.ok ? "Alamat berhasil disimpan." : "Alamat gagal disimpan. Periksa kembali isian Anda.");
    } catch { setError(true); setMessage("Alamat gagal disimpan. Coba lagi."); }
    finally { setBusy(false); }
  }
  async function signOut() { await authClient.signOut(); router.push("/"); router.refresh(); }
  return <section id="alamat" className="mt-10 grid gap-5 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.7fr)]">
    <Card className="h-fit border-line bg-white shadow-none"><CardHeader><span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand"><UserRound className="size-5" /></span><CardTitle className="mt-2 text-base">Profil akun</CardTitle><CardDescription>Informasi akun Fleece Hearts</CardDescription></CardHeader><CardContent><strong className="block text-sm">{name}</strong><p className="mt-1 break-all text-xs text-stone">{email}</p><div className="mt-6 border-t border-line pt-5"><Button type="button" variant="ghost" size="sm" onClick={() => void signOut()} className="text-stone hover:text-brand"><LogOut className="size-4" /> Keluar dari akun</Button></div></CardContent></Card>
    <Card className="border-line bg-white shadow-none"><CardHeader><span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand"><MapPin className="size-5" /></span><CardTitle className="mt-2 text-base">Alamat pengiriman</CardTitle><CardDescription>Alamat ini otomatis diisi saat checkout. Kamu tetap bisa mengubahnya untuk setiap pesanan.</CardDescription></CardHeader><CardContent>{loading ? <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div> : <form onSubmit={save} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{fields.map(({ key, label, autoComplete, inputMode, wide }) => <label key={key} className={`block text-xs font-semibold ${wide ? "sm:col-span-2" : ""}`}>{label}<Input value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} autoComplete={autoComplete} inputMode={inputMode} required className="mt-1.5" /></label>)}</div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={busy} variant="brand" size="sm"><Save className="size-4" />{busy ? "Menyimpan..." : "Simpan alamat"}</Button>{message && <p role="status" className={`text-xs ${error ? "text-danger" : "text-brand"}`}>{message}</p>}</div></form>}</CardContent></Card>
  </section>;
}
