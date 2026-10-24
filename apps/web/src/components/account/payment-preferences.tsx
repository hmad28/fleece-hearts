"use client";

import { useEffect, useState } from "react";
import { Banknote, Check, CreditCard, QrCode, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockPaymentMethods } from "@/mocks/data/commerce";

const icons = { VIRTUAL_ACCOUNT: CreditCard, BANK_TRANSFER: Banknote, QRIS: QrCode, EWALLET: Wallet, COD: Banknote } as const;

export function PaymentPreferences() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { let active = true; fetch("/api/account/payment-preference").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => { if (active) setSelected(data.methodCode); }).catch(() => { if (active) setMessage("Preferensi pembayaran belum dapat dimuat."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  async function choose(code: string | null) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/account/payment-preference", { method: code ? "PUT" : "DELETE", headers: { "Content-Type": "application/json" }, ...(code ? { body: JSON.stringify({ methodCode: code }) } : {}) });
      if (!response.ok) throw new Error("Preferensi gagal disimpan.");
      setSelected(code); setMessage(code ? "Metode utama tersimpan untuk checkout berikutnya." : "Metode utama dihapus.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Preferensi gagal disimpan."); }
    finally { setBusy(false); }
  }
  if (loading) return <div aria-busy="true" className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 rounded-[20px]" />)}</div>;
  return <div className="space-y-5"><div className="rounded-[22px] border border-[#e9e2dc] bg-white p-5 sm:p-6"><h2 className="text-[1.1rem] font-semibold">Metode utama</h2><p className="mt-2 text-sm leading-6 text-stone">Simpan pilihan metode untuk mempercepat checkout. Nomor kartu dan data pembayaran sensitif tidak disimpan.</p></div>{message && <p role="status" className="text-sm text-brand">{message}</p>}<div className="grid gap-3 md:grid-cols-2">{mockPaymentMethods.map((method) => { const Icon = icons[method.type]; const active = selected === method.code; return <button key={method.code} type="button" disabled={busy} onClick={() => void choose(method.code)} aria-pressed={active} className={`flex min-h-24 items-center gap-4 rounded-[20px] border bg-white p-5 text-left transition-colors disabled:opacity-60 ${active ? "border-brand ring-1 ring-brand" : "border-[#e9e2dc] hover:border-brand/50"}`}><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${active ? "bg-brand text-white" : "bg-[#f5f0ec] text-brand"}`}><Icon className="size-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{method.name}</strong><span className="mt-1 block text-xs text-stone">{method.type === "COD" ? "Tergantung jarak pengiriman" : "Pilihan pembayaran simulasi"}</span></span>{active && <Check className="size-5 shrink-0 text-brand" />}</button>; })}</div>{selected && <Button type="button" variant="outline" disabled={busy} onClick={() => void choose(null)}>Hapus metode utama</Button>}</div>;
}
