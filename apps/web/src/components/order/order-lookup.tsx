"use client";

import { orderLookupSchema } from "@fh/validation";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { services } from "@/services";

export function OrderLookup() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = orderLookupSchema.safeParse({ orderNumber, contact });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Periksa data pesanan.");
    setLoading(true);
    try {
      const order = await services.orders.lookupOrder(parsed.data);
      if (!order) {
        setError("Pesanan tidak ditemukan. Periksa nomor order dan email atau nomor WhatsApp yang dipakai saat checkout.");
        return;
      }
      router.push(order.paymentStatus === "PENDING" ? `/orders/${order.id}/payment` : `/orders/${order.id}`);
    } catch {
      setError("Gagal mengecek pesanan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto min-h-[60svh] max-w-[90rem] px-4 pt-14 md:px-8 md:pt-20">
    <h1 className="font-display text-[clamp(3rem,9vw,6rem)]">Cek order</h1>
    <p className="mt-4 max-w-xl text-stone">Masukkan nomor order dan email atau WhatsApp yang digunakan saat checkout. Pesanan demo tersimpan di browser ini.</p>
    <form onSubmit={submit} className="mt-10 max-w-lg space-y-5">
      <label className="block text-sm">Nomor order<input value={orderNumber} onChange={(event) => { setOrderNumber(event.target.value); setError(""); }} required placeholder="FH-202610-…" className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-4 outline-none focus:border-ink" /></label>
      <label className="block text-sm">Email atau WhatsApp<input value={contact} placeholder="nama@email.com atau 08xxxxxxxxxx" onChange={(event) => { setContact(event.target.value); setError(""); }} required className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-4 outline-none focus:border-ink" /></label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" variant="brand" size="lg" disabled={loading}>{loading ? "Mencari…" : "Lihat pesanan"}</Button>
    </form>
  </div>;
}
