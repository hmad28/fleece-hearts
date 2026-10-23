"use client";

import type { Order } from "@fh/types";
import { formatRupiah } from "@fh/shared";
import { useQuery } from "@tanstack/react-query";
import { Check, CircleCheck, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RouteMap } from "@/components/map/route-map";
import { Media } from "@/components/ui/media";
import { STORE_LOCATION } from "@/config/store-location";
import { getRoute } from "@/lib/geo/route";
import { geocode } from "@/lib/geo/wilayah";
import { cn } from "@/lib/utils";
import { services } from "@/services";
import { TRACKING_STEPS_MS } from "@/services/mock/orders";

const EVENT_LABEL: Record<string, string> = {
  PENDING: "Pesanan dibuat", CONFIRMED: "Pesanan dikonfirmasi", PAID: "Pembayaran berhasil", PROCESSING: "Pesanan diproses",
  PACKED: "Pesanan dikemas", READY: "Siap dikirim", PICKED_UP: "Diserahkan ke kurir", IN_TRANSIT: "Dalam pengiriman",
  SHIPPED: "Dalam pengiriman", DELIVERED: "Pesanan sampai", FAILED: "Pembayaran gagal", EXPIRED: "Pembayaran kedaluwarsa",
  CANCELLED: "Pesanan dibatalkan",
};

/** 6 tahap yang dilihat pembeli. */
const STAGES = ["Pesanan dibuat", "Pembayaran berhasil", "Diproses", "Diserahkan ke kurir", "Dalam pengiriman", "Sampai"] as const;

function stageIndex(order: Order): number {
  const seen = new Set(order.timeline.map((e) => e.status));
  seen.add(order.shipmentStatus);
  seen.add(order.status);
  if (seen.has("DELIVERED")) return 5;
  if (seen.has("IN_TRANSIT")) return 4;
  if (seen.has("PICKED_UP") || seen.has("SHIPPED")) return 3;
  if (seen.has("PROCESSING") || seen.has("PACKED") || seen.has("READY")) return 2;
  if (order.paymentStatus === "PAID" || seen.has("CONFIRMED")) return 1;
  return 0;
}

function courierProgress(order: Order, now: number): number | undefined {
  const stage = stageIndex(order);
  if (stage >= 5) return 1;
  if (stage === 4) {
    const at = order.timeline.find((e) => e.status === "IN_TRANSIT")?.at;
    const span = TRACKING_STEPS_MS.DELIVERED - TRACKING_STEPS_MS.IN_TRANSIT;
    const t = at ? Math.min(1, Math.max(0, (now - new Date(at).getTime()) / span)) : 0.5;
    return 0.04 + 0.92 * t;
  }
  if (stage === 3) return 0.02;
  return undefined;
}

const when = (iso: string) => new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export function OrderDetail({ id, fresh = false }: { id: string; fresh?: boolean }) {
  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => services.orders.getOrder(id),
    refetchInterval: (query) => {
      const o = query.state.data;
      if (!o || o.shipmentStatus === "DELIVERED" || o.status === "CANCELLED") return false;
      return o.paymentStatus === "PAID" || o.status === "CONFIRMED" || o.status === "PROCESSING" || o.status === "PACKED" || o.status === "SHIPPED" ? 2_000 : false;
    },
  });
  const order = orderQuery.data;
  const methodsQuery = useQuery({ queryKey: ["payment-methods"], queryFn: () => services.payment.listMethods() });
  const method = methodsQuery.data?.find((item) => item.code === order?.paymentMethodCode);

  const address = order?.shippingAddress;
  const destQuery = useQuery({
    queryKey: ["order-dest", id, address?.latitude, address?.longitude, address?.district],
    enabled: Boolean(address),
    staleTime: Infinity,
    queryFn: async () => {
      if (address!.latitude != null && address!.longitude != null) return { lat: address!.latitude, lng: address!.longitude };
      return geocode([address!.village, address!.district, address!.city].filter(Boolean).join(", "));
    },
  });
  const dest = destQuery.data ?? null;
  const routeQuery = useQuery({ queryKey: ["route", dest?.lat, dest?.lng], queryFn: () => getRoute(dest!), enabled: Boolean(dest), staleTime: Infinity });

  const stage = order ? stageIndex(order) : 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (stage !== 4) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [stage]);
  const [copied, setCopied] = useState(false);

  if (orderQuery.isLoading) return <div className="mx-auto max-w-[90rem] px-4 py-20 text-stone md:px-8">Memuat pesanan…</div>;
  if (!order || !address) return <div className="mx-auto min-h-[60svh] max-w-[90rem] px-4 py-20 md:px-8"><h1 className="font-display text-4xl">Pesanan tidak ditemukan</h1><p className="mt-4">Pesanan demo hanya tersedia di browser tempat checkout dilakukan.</p><Link href="/orders" className="mt-4 inline-block underline">Cek nomor order lain</Link></div>;

  const cod = method?.type === "COD";
  const progress = courierProgress(order, now);
  const stageLabels = STAGES.map((s, i) => (i === 1 && cod ? (order.paymentStatus === "PAID" ? "Dibayar (COD)" : "Dikonfirmasi (COD)") : s));
  const eta = order.etaLabel;

  return <div className="mx-auto max-w-[90rem] px-4 pt-12 md:px-8 md:pt-20">
    <p className="text-sm text-stone">Pembayaran / Konfirmasi / Pengiriman</p>
    {fresh && (order.paymentStatus === "PAID" || cod) && (
      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-brand p-5 text-paper" role="status">
        <CircleCheck className="mt-0.5 size-6 shrink-0" aria-hidden />
        <div><p className="font-semibold">{cod ? "Pesanan COD dibuat." : "Pembayaran diterima."} Terima kasih!</p><p className="text-sm">Konfirmasi pesanan juga dikirim ke {order.customer.email} (simulasi).</p></div>
      </div>
    )}
    <h1 className="font-display mt-4 text-[clamp(3rem,9vw,6rem)]">{order.paymentStatus === "PAID" || cod ? "Pesanan berhasil" : "Detail pesanan"}</h1>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <p className="tabular text-lg">Order ID {order.orderNumber}</p>
      <button type="button" onClick={() => { void navigator.clipboard?.writeText(order.orderNumber); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs hover:border-ink">
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}{copied ? "Tersalin" : "Salin"}
      </button>
    </div>
    {order.paymentStatus === "PENDING" && !cod && <p className="mt-4">Pembayaran masih menunggu. <Link href={`/orders/${id}/payment`} className="underline">Lanjutkan pembayaran</Link></p>}

    {/* Stepper 6 tahap */}
    <ol className="mt-10 grid grid-cols-3 gap-y-6 md:grid-cols-6" aria-label="Status pesanan">
      {stageLabels.map((label, i) => {
        const done = i <= stage;
        const current = i === stage;
        return (
          <li key={label} className="relative pr-2" aria-current={current ? "step" : undefined}>
            <div className={cn("h-1 rounded-full", done ? "bg-ink" : "bg-line")} />
            <p className={cn("mt-3 flex items-center gap-1.5 text-sm", done ? "text-ink" : "text-stone")}>
              <span className={cn("inline-flex size-5 items-center justify-center rounded-full text-[10px]", done ? "bg-brand text-paper" : "border border-line")}>{done ? <Check className="size-3" aria-hidden /> : i + 1}</span>
              {label}
            </p>
            {current && <p className="mt-1 text-xs text-stone">Sekarang</p>}
          </li>
        );
      })}
    </ol>

    <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:gap-20">
      <div>
        <section aria-labelledby="map-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="map-heading" className="font-display text-3xl">Lacak pengiriman</h2>
            {order.trackingNumber && <p className="tabular text-sm">Resi: {order.trackingNumber}</p>}
          </div>
          <RouteMap
            className="mt-5 h-80 md:h-[26rem]"
            origin={{ ...STORE_LOCATION, label: `Toko · ${STORE_LOCATION.short}` }}
            destination={dest ? { ...dest, label: address.village ?? address.district } : null}
            route={routeQuery.data?.coords}
            courierProgress={progress}
          />
          <p className="mt-2 text-sm text-stone">
            {stage >= 5 ? "Paket sudah sampai." : stage === 4 ? `Kurir dalam perjalanan${eta ? ` · estimasi ${eta}` : ""}.` : stage === 3 ? "Paket sudah diserahkan ke kurir." : "Paket masih di toko."}
            {" "}Dari {STORE_LOCATION.short}{order.distanceKm ? ` · ±${order.distanceKm.toLocaleString("id-ID")} km` : ""}. Posisi kurir adalah simulasi.
          </p>
        </section>

        <section aria-labelledby="timeline-heading" className="mt-12">
          <h2 id="timeline-heading" className="font-display text-3xl">Riwayat</h2>
          <p className="mt-2 text-sm text-stone">Demo: status maju otomatis sekitar 1,5 menit setelah pembayaran. Tim toko juga bisa mengubahnya dari dashboard admin.</p>
          <ol className="mt-6 space-y-5 border-l-2 border-line pl-6">
            {[...order.timeline].reverse().map((event, index) => (
              <li key={`${event.status}-${event.at}-${index}`} className="relative">
                <span className={cn("absolute -left-[1.95rem] top-1 size-3.5 rounded-full border-2 border-paper", index === 0 ? "bg-brand ring-2 ring-ink" : "bg-ink")} />
                <p className="font-medium">{EVENT_LABEL[event.status] ?? event.status}</p>
                {event.note && <p className="text-sm text-stone">{event.note}</p>}
                <p className="text-xs text-stone">{when(event.at)} WIB</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="items-heading" className="mt-12">
          <h2 id="items-heading" className="font-display text-3xl">Produk</h2>
          <ul className="mt-5 divide-y divide-line border-t border-line">{order.items.map((item) => <li key={item.id} className="flex gap-4 py-4"><Media asset={{ url: item.imageUrl, alt: item.productName }} sizes="80px" className="aspect-[4/5] w-20 shrink-0 rounded-lg" /><div className="flex-1 text-sm"><p>{item.productName}</p><p className="text-stone">{item.size} · {item.color} · {item.quantity} × {formatRupiah(item.unitPrice)}</p><p className="tabular mt-2">{formatRupiah(item.lineTotal)}</p></div></li>)}</ul>
        </section>
      </div>

      <aside className="h-fit border-t border-ink pt-5 lg:sticky lg:top-24">
        <h2 className="font-display text-3xl">Ringkasan</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Status pesanan" value={stageLabels[stage] ?? order.status} />
          <Row label="Pembayaran" value={order.paymentStatus === "PAID" ? "Berhasil" : cod ? "Bayar saat tiba" : order.paymentStatus === "EXPIRED" ? "Kedaluwarsa" : "Menunggu"} />
          <Row label="Metode bayar" value={method?.name ?? order.paymentMethodCode} />
          <Row label="Pengiriman" value={`${order.courierCode.toUpperCase()} ${order.courierService}${eta ? ` · ${eta}` : ""}`} />
          <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
          <Row label="Ongkir" value={formatRupiah(order.shippingFee)} />
          {order.paymentFee > 0 && <Row label="Biaya pembayaran" value={formatRupiah(order.paymentFee)} />}
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd className="tabular">{formatRupiah(order.total)}</dd></div>
        </dl>
        <div className="mt-8 border-t border-line pt-5 text-sm">
          <h3 className="font-semibold">Alamat pengiriman</h3>
          <p className="mt-2">{address.recipientName} · {address.phone}<br />{address.line1}<br />{[address.village, address.district, address.city, address.province].filter(Boolean).join(", ")} {address.postalCode}</p>
          {address.notes && <p className="mt-2 text-stone">Catatan: {address.notes}</p>}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href={`/account/chat?order=${encodeURIComponent(order.orderNumber)}`} className="underline">Tanya admin soal pesanan ini</Link>
          <Link href="/orders" className="underline">Cek order lain</Link>
          <Link href="/shop" className="underline">Belanja lagi</Link>
        </div>
      </aside>
    </div>
  </div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-stone">{label}</dt><dd className="text-right">{value}</dd></div>;
}
