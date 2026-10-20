"use client";

import { formatRupiah } from "@fh/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { services } from "@/services";

export function DemoPayment({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const orderQuery = useQuery({ queryKey: ["order", id], queryFn: () => services.orders.getOrder(id) });
  const order = orderQuery.data;
  const paymentQuery = useQuery({
    queryKey: ["payment", order?.paymentId],
    queryFn: () => services.payment.getPaymentStatus(order!.paymentId!),
    enabled: Boolean(order?.paymentId),
  });
  const payment = paymentQuery.data;
  const methodsQuery = useQuery({ queryKey: ["payment-methods"], queryFn: () => services.payment.listMethods() });
  const method = methodsQuery.data?.find((item) => item.code === order?.paymentMethodCode);

  async function pay() {
    if (!payment || !services.payment.simulatePayment) return;
    setSubmitting(true);
    setError("");
    try {
      await services.payment.simulatePayment(payment.id);
      await queryClient.invalidateQueries({ queryKey: ["order", id] });
      router.push(`/orders/${id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Simulasi pembayaran gagal.");
      setSubmitting(false);
    }
  }

  if (orderQuery.isLoading || (order && paymentQuery.isLoading)) return <div className="mx-auto max-w-[90rem] px-4 py-20 text-stone md:px-8">Memuat pembayaran…</div>;
  if (!order || !payment) return <div className="mx-auto min-h-[60svh] max-w-[90rem] px-4 py-20 md:px-8"><h1 className="font-display text-4xl">Pesanan tidak ditemukan</h1><p className="mt-4">Pesanan demo hanya tersedia di browser tempat checkout dilakukan.</p><Link href="/shop" className="mt-4 inline-block underline">Kembali belanja</Link></div>;

  return <div className="mx-auto min-h-[60svh] max-w-[90rem] px-4 pt-12 md:px-8 md:pt-20">
    <p className="text-sm text-stone">Checkout / Pembayaran / Konfirmasi</p>
    <h1 className="font-display mt-3 text-[clamp(3rem,9vw,6rem)]">Pembayaran</h1>
    <div className="mt-10 grid max-w-4xl gap-8 md:grid-cols-2">
      <section className="rounded-2xl bg-mist p-6 md:p-8" aria-label="Instruksi pembayaran">
        <p className="text-sm text-stone">Nomor order</p><p className="tabular mt-1 font-semibold">{order.orderNumber}</p>
        <p className="mt-6 text-sm text-stone">Total pembayaran</p><p className="font-display tabular mt-1 text-4xl">{formatRupiah(order.total)}</p>
        <p className="mt-6 text-sm text-stone">Metode</p><p className="mt-1">{method?.name ?? order.paymentMethodCode}</p>
        {payment.instructions.vaNumber && <p className="mt-4 text-sm">VA demo: <strong className="tabular">{payment.instructions.vaNumber}</strong></p>}
        {payment.instructions.qrString && <p className="mt-4 text-sm">Kode QRIS demo: <strong>{payment.instructions.qrString}</strong></p>}
        {payment.instructions.deeplinkUrl && <p className="mt-4 text-sm">E-wallet demo: lanjutkan dengan tombol simulasi.</p>}
      </section>
      <section className="flex flex-col justify-center">
        <p className="text-sm uppercase tracking-widest text-stone">Status: {payment.status === "PENDING" ? "Menunggu pembayaran" : payment.status === "PAID" ? "Berhasil" : "Kedaluwarsa"}</p>
        <p className="mt-4 text-lg">Ini alur demo. Tidak ada transaksi bank atau uang sungguhan.</p>
        {payment.status === "PENDING" ? <>
          <p className="mt-2 text-sm text-stone">Selesaikan sebelum {new Date(payment.expiresAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB.</p>
          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
          <Button type="button" variant="brand" size="lg" onClick={pay} disabled={submitting} className="mt-7 self-start">{submitting ? "Memproses…" : "Simulasikan pembayaran berhasil"}</Button>
        </> : payment.status === "PAID" ? <Link href={`/orders/${id}`} className="mt-7 inline-block underline">Lihat konfirmasi pesanan</Link> : <p className="mt-4 text-danger">Pembayaran demo telah berakhir. Silakan buat pesanan baru.</p>}
      </section>
    </div>
  </div>;
}
