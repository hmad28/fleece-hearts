"use client";

import { formatRupiah } from "@fh/shared";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Media } from "@/components/ui/media";
import { services } from "@/services";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pesanan dibuat", PAID: "Pembayaran berhasil", PROCESSING: "Pesanan diproses",
  PACKED: "Pesanan dikemas", PICKED_UP: "Diserahkan ke kurir", IN_TRANSIT: "Dalam pengiriman",
  SHIPPED: "Dalam pengiriman", DELIVERED: "Pesanan sampai", FAILED: "Pembayaran gagal", EXPIRED: "Pembayaran kedaluwarsa",
};

export function OrderDetail({ id }: { id: string }) {
  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => services.orders.getOrder(id),
    refetchInterval: (query) => query.state.data?.paymentStatus === "PAID" && query.state.data?.shipmentStatus !== "DELIVERED" ? 2_000 : false,
  });
  const order = orderQuery.data;
  const methodsQuery = useQuery({ queryKey: ["payment-methods"], queryFn: () => services.payment.listMethods() });
  const method = methodsQuery.data?.find((item) => item.code === order?.paymentMethodCode);

  if (orderQuery.isLoading) return <div className="mx-auto max-w-[90rem] px-4 py-20 text-stone md:px-8">Memuat pesanan…</div>;
  if (!order) return <div className="mx-auto min-h-[60svh] max-w-[90rem] px-4 py-20 md:px-8"><h1 className="font-display text-4xl">Pesanan tidak ditemukan</h1><p className="mt-4">Pesanan demo hanya tersedia di browser tempat checkout dilakukan.</p><Link href="/orders" className="mt-4 inline-block underline">Cek nomor order lain</Link></div>;

  const address = order.shippingAddress;
  return <div className="mx-auto max-w-[90rem] px-4 pt-12 md:px-8 md:pt-20">
    <p className="text-sm text-stone">Pembayaran / Konfirmasi / Pengiriman</p>
    <h1 className="font-display mt-3 text-[clamp(3rem,9vw,6rem)]">{order.paymentStatus === "PAID" ? "Pesanan berhasil" : "Detail pesanan"}</h1>
    <p className="tabular mt-3 text-lg">{order.orderNumber}</p>
    {order.paymentStatus === "PENDING" && <p className="mt-4">Pembayaran masih menunggu. <Link href={`/orders/${id}/payment`} className="underline">Lanjutkan pembayaran</Link></p>}
    <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:gap-20">
      <div>
        <section aria-labelledby="items-heading"><h2 id="items-heading" className="font-display text-3xl">Produk</h2><ul className="mt-5 divide-y divide-line border-t border-line">{order.items.map((item) => <li key={item.id} className="flex gap-4 py-4"><Media asset={{ url: item.imageUrl, alt: item.productName }} sizes="80px" className="aspect-[4/5] w-20 shrink-0" /><div className="flex-1 text-sm"><p>{item.productName}</p><p className="text-stone">{item.size} · {item.color} · {item.quantity} × {formatRupiah(item.unitPrice)}</p><p className="tabular mt-2">{formatRupiah(item.lineTotal)}</p></div></li>)}</ul></section>
        <section aria-labelledby="tracking-heading" className="mt-12"><h2 id="tracking-heading" className="font-display text-3xl">Perjalanan pesanan</h2><p className="mt-2 text-sm text-stone">Status pengiriman diperbarui otomatis dalam sekitar 25 detik untuk demo.</p>{order.trackingNumber && <p className="tabular mt-3 text-sm">Resi simulasi: {order.trackingNumber}</p>}<ol className="mt-6 space-y-4 border-l-2 border-brand pl-6">{order.timeline.map((event, index) => <li key={`${event.status}-${index}`} className="relative"><span className="absolute -left-[1.9rem] top-1 size-3 rounded-full bg-brand" /><p className="font-medium">{STATUS_LABEL[event.status] ?? event.status}</p><p className="text-xs text-stone">{new Date(event.at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })} WIB</p></li>)}</ol></section>
      </div>
      <aside className="h-fit border-t border-ink pt-5"><h2 className="font-display text-3xl">Ringkasan</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt>Status pesanan</dt><dd className="text-right">{STATUS_LABEL[order.status] ?? order.status}</dd></div><div className="flex justify-between gap-4"><dt>Pembayaran</dt><dd>{order.paymentStatus === "PAID" ? "Berhasil" : "Menunggu"}</dd></div><div className="flex justify-between gap-4"><dt>Metode bayar</dt><dd className="text-right">{method?.name ?? order.paymentMethodCode}</dd></div><div className="flex justify-between gap-4"><dt>Pengiriman</dt><dd>{order.courierCode.toUpperCase()} {order.courierService}</dd></div><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatRupiah(order.subtotal)}</dd></div><div className="flex justify-between"><dt>Ongkir</dt><dd>{formatRupiah(order.shippingFee)}</dd></div><div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total pembayaran</dt><dd>{formatRupiah(order.total)}</dd></div></dl><div className="mt-8 border-t border-line pt-5 text-sm"><h3 className="font-semibold">Alamat pengiriman</h3><p className="mt-2">{address.recipientName} · {address.phone}<br />{address.line1}<br />{address.district}, {address.city}, {address.province} {address.postalCode}</p>{address.notes && <p className="mt-2 text-stone">Catatan: {address.notes}</p>}</div><Link href="/orders" className="mt-8 inline-block text-sm underline">Cek order lain</Link></aside>
    </div>
  </div>;
}
