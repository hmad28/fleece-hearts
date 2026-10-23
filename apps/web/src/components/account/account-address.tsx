"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";

type Address = {
  recipientName: string; phone: string; province: string; city: string;
  district: string; postalCode: string; line1: string;
};

const blank: Address = { recipientName: "", phone: "", province: "", city: "", district: "", postalCode: "", line1: "" };
const fields: { key: keyof Address; label: string; autoComplete?: string; inputMode?: "text" | "tel" | "numeric"; wide?: boolean }[] = [
  { key: "recipientName", label: "Nama penerima", autoComplete: "name" },
  { key: "phone", label: "Nomor HP", autoComplete: "tel", inputMode: "tel" },
  { key: "province", label: "Provinsi", autoComplete: "address-level1" },
  { key: "city", label: "Kota / kabupaten", autoComplete: "address-level2" },
  { key: "district", label: "Kecamatan", autoComplete: "address-level3" },
  { key: "postalCode", label: "Kode pos", autoComplete: "postal-code", inputMode: "numeric" },
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
    fetch("/api/account/address")
      .then((res) => { if (!res.ok) throw new Error("Alamat belum dapat dimuat."); return res.json(); })
      .then((data) => { if (active && data?.address) setAddress(data.address); })
      .catch(() => { if (active) { setError(true); setMessage("Alamat belum dapat dimuat."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/account/address", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(address) });
      setError(!res.ok);
      setMessage(res.ok ? "Alamat berhasil disimpan." : "Alamat gagal disimpan. Periksa kembali isian Anda.");
    } catch { setError(true); setMessage("Alamat gagal disimpan. Coba lagi."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return <section id="alamat" aria-labelledby="address-heading" className="mt-20 border-t border-ink pt-12 sm:mt-28 sm:pt-16">
    <div className="grid gap-14 lg:grid-cols-[minmax(14rem,0.42fr)_minmax(0,1fr)] lg:gap-16">
      <aside>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand">02 / Profil</p>
        <h2 className="font-display mt-5 text-4xl sm:text-5xl">Identitasmu</h2>
        <div className="mt-8 border-l-2 border-brand pl-5">
          <p className="text-lg font-semibold">{name}</p>
          <p className="mt-1 break-all text-sm text-stone">{email}</p>
        </div>
        <button type="button" onClick={() => void signOut()} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-stone underline underline-offset-4 transition-colors hover:text-brand"><LogOut className="size-4" aria-hidden /> Keluar dari akun</button>
      </aside>

      <div>
        <div className="flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone">Alamat utama</p>
            <h3 id="address-heading" className="font-display mt-3 text-3xl sm:text-4xl">Siap untuk checkout berikutnya.</h3>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-stone">Tersimpan untuk mengisi checkout lebih cepat. Kamu tetap bisa mengubahnya saat belanja.</p>
        </div>
        {loading ? <p role="status" className="py-10 text-sm text-stone">Memuat alamat…</p> : <form onSubmit={save} className="pt-8">
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {fields.map(({ key, label, autoComplete, inputMode, wide }) => <label key={key} className={`block text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
              {label}
              <input value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} autoComplete={autoComplete} inputMode={inputMode} required className="mt-2 h-12 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-base font-normal outline-none transition-colors placeholder:text-stone focus:border-brand focus:ring-0" />
            </label>)}
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-brand px-7 text-sm font-semibold text-paper transition-colors hover:bg-brand-press disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan alamat"}<ArrowRight className="size-4" aria-hidden /></button>
            {message && <p role="status" className={`text-sm ${error ? "text-danger" : "text-brand"}`}>{message}</p>}
          </div>
        </form>}
      </div>
    </div>
  </section>;
}
