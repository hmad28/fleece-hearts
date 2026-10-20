"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

type Address = {
  recipientName: string; phone: string; province: string; city: string;
  district: string; postalCode: string; line1: string;
};

const blank: Address = { recipientName: "", phone: "", province: "", city: "", district: "", postalCode: "", line1: "" };
const fields: { key: keyof Address; label: string }[] = [
  { key: "recipientName", label: "Nama penerima" }, { key: "phone", label: "Nomor HP" },
  { key: "province", label: "Provinsi" }, { key: "city", label: "Kota / kabupaten" },
  { key: "district", label: "Kecamatan" }, { key: "postalCode", label: "Kode pos" },
  { key: "line1", label: "Alamat lengkap" },
];

export function AccountAddress({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [address, setAddress] = useState<Address>(blank);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/account/address").then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.address) setAddress(data.address); })
      .catch(() => setMessage("Alamat belum dapat dimuat."));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/account/address", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(address) });
      setMessage(res.ok ? "Alamat tersimpan." : "Alamat gagal disimpan. Periksa kembali isian Anda.");
    } catch { setMessage("Alamat gagal disimpan. Coba lagi."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return <div className="mx-auto max-w-2xl px-4 py-16 md:py-24">
    <p className="text-sm uppercase tracking-widest text-stone">Akun saya</p>
    <h1 className="font-display mt-3 text-5xl">Halo, {name}</h1>
    <p className="mt-3 text-stone">{email}</p>
    <button type="button" onClick={signOut} className="mt-5 text-sm underline">Keluar</button>
    <form onSubmit={save} className="mt-12 space-y-5 border-t border-line pt-8">
      <h2 className="font-display text-3xl">Alamat tersimpan</h2>
      <p className="text-sm text-stone">Alamat ini otomatis diisi saat Anda checkout dalam keadaan masuk.</p>
      {fields.map(({ key, label }) => <label key={key} className="block text-sm">{label}<input value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} required className="mt-1 h-12 w-full rounded-xl border border-line bg-paper px-4" /></label>)}
      {message && <p role="status" className="text-sm">{message}</p>}
      <button type="submit" disabled={busy} className="h-12 rounded-full bg-ink px-8 text-paper disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan alamat"}</button>
    </form>
  </div>;
}
