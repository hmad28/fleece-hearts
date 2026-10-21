"use client";

import type { PaymentMethod, Product, ShippingRate } from "@fh/types";
import { formatRupiah } from "@fh/shared";
import { checkoutSchema } from "@fh/validation";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { RouteMap } from "@/components/map/route-map";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { STORE_LOCATION } from "@/config/store-location";
import { getRoute } from "@/lib/geo/route";
import { geocode, wilayah, type LatLng, type Region } from "@/lib/geo/wilayah";
import { cn } from "@/lib/utils";
import { COD_MAX_KM } from "@/mocks/data/commerce";
import { services } from "@/services";
import { useCartStore } from "@/stores/cart-store";
import { RegionSelect } from "./region-select";

const initialForm = {
  name: "", email: "", phone: "", recipientName: "", recipientPhone: "",
  postalCode: "", line1: "", notes: "",
};
const inputClass = "mt-1 h-12 w-full rounded-xl border border-line bg-paper px-4 outline-none focus:border-ink";

type RegionPick = { province: Region | null; regency: Region | null; district: Region | null; village: Region | null };
const emptyRegion: RegionPick = { province: null, regency: null, district: null, village: null };

const GROUP_LABEL: Record<NonNullable<ShippingRate["group"]>, string> = {
  REGULER: "Reguler", EXPRESS: "Express", SAME_DAY: "Same Day", INSTANT: "Instan",
};
const PAYMENT_GROUP: { type: PaymentMethod["type"]; label: string }[] = [
  { type: "VIRTUAL_ACCOUNT", label: "Virtual Account" },
  { type: "BANK_TRANSFER", label: "Transfer bank" },
  { type: "QRIS", label: "QRIS" },
  { type: "EWALLET", label: "E-wallet" },
  { type: "COD", label: "Bayar di tempat" },
];

/** Cocokkan nama wilayah tersimpan ("KOTA BEKASI" vs "Kota Bekasi"). */
function matchByName(list: Region[], name: string) {
  const n = name.trim().toLowerCase().replace(/^(kab\.?|kabupaten|kota)\s+/, "");
  return list.find((r) => r.name.toLowerCase() === name.trim().toLowerCase())
    ?? list.find((r) => r.name.toLowerCase().replace(/^(kab\.?|kabupaten|kota)\s+/, "") === n);
}

export function CheckoutForm() {
  const router = useRouter();
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [region, setRegion] = useState<RegionPick>(emptyRegion);
  const [point, setPoint] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [shippingCode, setShippingCode] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Prefill dari akun (kalau masuk). Nama wilayah dicocokkan ke data wilayah.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/address").then((res) => res.ok ? res.json() : null)
      .then(async (data) => {
        if (!data?.customer || cancelled) return;
        setForm((current) => ({
          ...current,
          name: data.customer.name ?? current.name,
          email: data.customer.email ?? current.email,
          phone: data.address?.phone ?? current.phone,
          ...(data.address ? {
            recipientName: data.address.recipientName,
            recipientPhone: data.address.phone,
            postalCode: data.address.postalCode,
            line1: data.address.line1,
          } : {}),
        }));
        if (!data.address) return;
        const province = matchByName(await wilayah.provinces(), data.address.province) ?? null;
        const regency = province ? matchByName(await wilayah.regencies(province.id), data.address.city) ?? null : null;
        const district = regency ? matchByName(await wilayah.districts(regency.id), data.address.district) ?? null : null;
        if (!cancelled && province) setRegion({ province, regency, district, village: null });
      }).catch(() => { /* Guest checkout tetap tersedia. */ });
    return () => { cancelled = true; };
  }, []);

  // Titik tujuan: koordinat kelurahan → fallback geocode Nominatim.
  useEffect(() => {
    const { village, district, regency, province } = region;
    if (!district || !regency || !province) { setPoint(null); return; }
    if (village?.lat && village.lng) { setPoint({ lat: village.lat, lng: village.lng }); return; }
    let cancelled = false;
    setLocating(true);
    const q = [village?.name, district.name, regency.name, province.name].filter(Boolean).join(", ");
    geocode(q).then(async (hit) => hit ?? geocode([district.name, regency.name].join(", ")))
      .then((hit) => { if (!cancelled) setPoint(hit ?? (district.lat && district.lng ? { lat: district.lat, lng: district.lng } : null)); })
      .finally(() => { if (!cancelled) setLocating(false); });
    return () => { cancelled = true; };
  }, [region]);

  const routeQuery = useQuery({
    queryKey: ["route", point?.lat, point?.lng],
    queryFn: () => getRoute(point!),
    enabled: Boolean(point),
    staleTime: Infinity,
  });
  const route = routeQuery.data;
  const distanceKm = route ? Math.round(route.distanceKm * 10) / 10 : undefined;

  const ids = useMemo(() => [...new Set(cartItems.map((item) => item.productId))].sort(), [cartItems]);
  const productsQuery = useQuery({
    queryKey: ["checkout-products", ids],
    queryFn: () => services.catalog.getProductsByIds(ids),
    enabled: hydrated && ids.length > 0,
  });
  const products = productsQuery.data ?? [];
  const byId = new Map<string, Product>(products.map((product) => [product.id, product]));
  const lines = cartItems.flatMap((item) => {
    const product = byId.get(item.productId);
    const variant = product?.variants.find((value) => value.id === item.variantId);
    if (!product || !variant) return [];
    const price = variant.price ?? product.price;
    return [{ ...item, product, variant, price, total: price * item.quantity }];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const weightGram = lines.reduce((sum, line) => sum + (line.variant.weightGram ?? line.product.weightGram) * line.quantity, 0);
  const invalidCart = lines.length !== cartItems.length || lines.some((line) => line.quantity > line.variant.available || line.variant.status !== "ACTIVE");

  const ratesQuery = useQuery({
    queryKey: ["shipping-rates", weightGram, subtotal, distanceKm],
    queryFn: () => services.shipping.getRates({
      destination: { city: region.regency?.name ?? "", district: region.district?.name ?? "", postalCode: form.postalCode, latitude: point?.lat, longitude: point?.lng },
      distanceKm,
      weightGram,
      itemValue: subtotal,
    }),
    enabled: hydrated && lines.length > 0 && !invalidCart && distanceKm != null,
  });
  const methodsQuery = useQuery({ queryKey: ["payment-methods"], queryFn: () => services.payment.listMethods() });
  const rates = ratesQuery.data ?? [];
  const methods = methodsQuery.data ?? [];
  const selectedRate = rates.find((rate) => `${rate.courierCode}:${rate.service}` === shippingCode && rate.available !== false);
  const selectedMethod = methods.find((method) => method.code === paymentCode);
  const codBlocked = distanceKm == null || distanceKm > COD_MAX_KM;
  const total = subtotal + (selectedRate?.price ?? 0) + (selectedMethod?.fee ?? 0);

  // Reset pilihan yang jadi tidak valid saat alamat berubah.
  useEffect(() => {
    if (shippingCode && rates.length && !rates.some((r) => `${r.courierCode}:${r.service}` === shippingCode && r.available !== false)) setShippingCode("");
  }, [rates, shippingCode]);
  useEffect(() => {
    if (selectedMethod?.type === "COD" && codBlocked) setPaymentCode("");
  }, [selectedMethod, codBlocked]);

  const update = (key: keyof typeof initialForm) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!region.province || !region.regency || !region.district) {
      setError("Pilih provinsi, kota/kabupaten, dan kecamatan.");
      return;
    }
    if (invalidCart || !selectedRate || !selectedMethod) {
      setError("Periksa isi keranjang, kurir, dan metode pembayaran.");
      return;
    }
    const result = checkoutSchema.safeParse({
      customer: { name: form.name, email: form.email, phone: form.phone },
      shippingAddress: {
        recipientName: form.recipientName || form.name,
        phone: form.recipientPhone || form.phone,
        province: region.province.name, city: region.regency.name, district: region.district.name,
        village: region.village?.name, postalCode: form.postalCode, line1: form.line1, notes: form.notes || undefined,
        latitude: point?.lat, longitude: point?.lng,
      },
      items: cartItems.map(({ variantId, quantity }) => ({ variantId, quantity })),
      courierCode: selectedRate.courierCode,
      courierService: selectedRate.service,
      paymentMethodCode: selectedMethod.code,
      distanceKm,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Periksa kembali formulir checkout.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await services.orders.createOrder(result.data);
      clearCart();
      router.push(selectedMethod.type === "COD" ? `/orders/${order.id}?baru=1` : `/orders/${order.id}/payment`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pesanan gagal dibuat. Coba lagi.");
      setSubmitting(false);
    }
  }

  if (!hydrated || (cartItems.length > 0 && productsQuery.isLoading)) {
    return <div className="mx-auto max-w-[90rem] px-4 py-20 text-stone md:px-8">Memuat checkout…</div>;
  }
  if (cartItems.length === 0) {
    return <div className="mx-auto min-h-[60svh] max-w-[90rem] px-4 py-20 md:px-8"><h1 className="font-display text-5xl">Keranjang kosong</h1><p className="mt-4">Pilih produk dulu untuk mulai checkout.</p><Link href="/shop" className="mt-6 inline-block underline">Lihat produk</Link></div>;
  }

  const groups = (["REGULER", "EXPRESS", "SAME_DAY", "INSTANT"] as const)
    .map((g) => ({ g, items: rates.filter((r) => (r.group ?? "REGULER") === g) }))
    .filter((x) => x.items.length > 0);

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-10 md:px-8 md:pt-16">
      <p className="text-sm text-stone">Keranjang / Checkout / Pembayaran</p>
      <h1 className="font-display mt-3 text-[clamp(3rem,8vw,6rem)]">Checkout</h1>
      <p className="mt-3 text-stone">Simulasi pembelian. Tidak ada pembayaran sungguhan dan tidak meminta data kartu.</p>
      <form onSubmit={submit} className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] lg:gap-20">
        <div className="space-y-12">
          <Section n={1} id="contact" title="Kontak">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama" value={form.name} onChange={update("name")} autoComplete="name" required />
              <Field label="Nomor WhatsApp" value={form.phone} onChange={update("phone")} type="tel" autoComplete="tel" required />
              <div className="sm:col-span-2"><Field label="Email untuk cek order" value={form.email} onChange={update("email")} type="email" autoComplete="email" required /></div>
            </div>
          </Section>

          <Section n={2} id="address" title="Alamat pengiriman" hint="Data wilayah dari API wilayah Indonesia (open data).">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama penerima (kosongkan jika sama)" value={form.recipientName} onChange={update("recipientName")} />
              <Field label="HP penerima (kosongkan jika sama)" value={form.recipientPhone} onChange={update("recipientPhone")} type="tel" />
              <RegionSelect id="province" label="Provinsi" placeholder="provinsi" queryKey={["wilayah", "prov"]} load={wilayah.provinces}
                value={region.province} onChange={(province) => setRegion({ ...emptyRegion, province })} />
              <RegionSelect id="regency" label="Kota / kabupaten" placeholder="kota/kabupaten" queryKey={region.province ? ["wilayah", "kab", region.province.id] : null}
                load={() => wilayah.regencies(region.province!.id)} value={region.regency} onChange={(regency) => setRegion((r) => ({ ...r, regency, district: null, village: null }))} />
              <RegionSelect id="district" label="Kecamatan" placeholder="kecamatan" queryKey={region.regency ? ["wilayah", "kec", region.regency.id] : null}
                load={() => wilayah.districts(region.regency!.id)} value={region.district} onChange={(district) => setRegion((r) => ({ ...r, district, village: null }))} />
              <RegionSelect id="village" label="Kelurahan / desa" placeholder="kelurahan/desa" queryKey={region.district ? ["wilayah", "kel", region.district.id] : null}
                load={() => wilayah.villages(region.district!.id)} value={region.village} onChange={(village) => setRegion((r) => ({ ...r, village }))} />
              <Field label="Kode pos" value={form.postalCode} onChange={update("postalCode")} inputMode="numeric" autoComplete="postal-code" required />
              <div className="sm:col-span-2"><Field label="Alamat lengkap (jalan, nomor, RT/RW)" value={form.line1} onChange={update("line1")} autoComplete="street-address" required /></div>
              <label className="text-sm sm:col-span-2">Catatan pesanan (opsional)
                <textarea value={form.notes} onChange={(event) => update("notes")(event.target.value)} rows={3} maxLength={200} className="mt-1 w-full rounded-xl border border-line bg-paper p-4 outline-none focus:border-ink" placeholder="Patokan rumah atau instruksi kurir" />
              </label>
            </div>
            <div className="mt-6">
              <RouteMap
                className="h-72 md:h-80"
                origin={{ ...STORE_LOCATION, label: `Toko · ${STORE_LOCATION.short}` }}
                destination={point ? { ...point, label: region.village?.name ?? region.district?.name ?? "Tujuan" } : null}
                route={route?.coords}
              />
              <p className="mt-2 flex items-start gap-2 text-sm text-stone" aria-live="polite">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {locating || routeQuery.isFetching
                  ? "Menghitung rute dari toko…"
                  : distanceKm != null
                    ? <>Dikirim dari {STORE_LOCATION.short} · ±{distanceKm.toLocaleString("id-ID")} km lewat jalan{route?.source === "estimate" ? " (perkiraan)" : ""}</>
                    : region.district ? "Lokasi tujuan tidak ditemukan. Coba pilih kelurahan." : "Pilih kecamatan untuk melihat rute dan ongkir."}
              </p>
            </div>
          </Section>

          <Section n={3} id="shipping" title="Pengiriman" hint="Ongkir simulasi berdasarkan jarak dari toko dan berat paket. Pilihan kurir mengubah ongkir dan estimasi tiba.">
            {distanceKm == null && <p className="rounded-xl bg-mist p-4 text-sm text-stone">Lengkapi alamat dulu untuk melihat pilihan kurir.</p>}
            {ratesQuery.isFetching && <p className="text-stone">Menghitung ongkir…</p>}
            <div className="space-y-6">
              {groups.map(({ g, items }) => (
                <div key={g}>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone">{GROUP_LABEL[g]}</p>
                  <div className="mt-2 space-y-2">
                    {items.map((rate) => {
                      const code = `${rate.courierCode}:${rate.service}`;
                      const off = rate.available === false;
                      return (
                        <label key={code} className={cn("flex items-center gap-3 rounded-xl border border-line p-4 has-checked:border-ink has-checked:bg-mist/60", off ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
                          <input type="radio" name="shipping" value={code} checked={shippingCode === code} onChange={() => setShippingCode(code)} disabled={off} required className="accent-ink" />
                          <span className="flex-1">{rate.courierName} {rate.serviceName}
                            <span className="block text-xs text-stone">{off ? rate.reason : `Estimasi ${rate.etaLabel ?? `${rate.etdDays.min}–${rate.etdDays.max} hari`}`}</span>
                          </span>
                          <span className="tabular text-sm">{formatRupiah(rate.price)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section n={4} id="payment" title="Metode pembayaran" hint="Semua metode adalah simulasi.">
            <div className="space-y-6">
              {PAYMENT_GROUP.map(({ type, label }) => {
                const items = methods.filter((m) => m.type === type);
                if (!items.length) return null;
                return (
                  <div key={type}>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{label}</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {items.map((method) => {
                        const off = method.type === "COD" && codBlocked;
                        return (
                          <label key={method.code} className={cn("flex items-center gap-3 rounded-xl border border-line p-4 has-checked:border-ink has-checked:bg-mist/60", off ? "cursor-not-allowed opacity-50" : "cursor-pointer", method.type === "COD" && "sm:col-span-2")}>
                            <input type="radio" name="payment" value={method.code} checked={paymentCode === method.code} onChange={() => setPaymentCode(method.code)} disabled={off} required className="accent-ink" />
                            <span className="flex-1 text-sm">{method.name}
                              {method.type === "COD" && <span className="block text-xs text-stone">{off ? `Hanya untuk tujuan ≤ ${COD_MAX_KM} km dari toko` : `Bayar tunai ke kurir · biaya ${formatRupiah(method.fee)}`}</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <aside className="h-fit border-t border-ink pt-5 lg:sticky lg:top-24" aria-label="Tinjau pesanan">
          <h2 className="font-display text-3xl">Tinjau pesanan</h2>
          <ul className="mt-5 divide-y divide-line">
            {lines.map((line) => <li key={line.variant.id} className="flex gap-4 py-4"><Media asset={line.product.images[0] ?? { url: null, alt: line.product.name }} sizes="72px" className="aspect-[4/5] w-[72px] shrink-0" /><div className="min-w-0 flex-1 text-sm"><p>{line.product.name}{line.product.colorway ? ` – ${line.product.colorway}` : ""}</p><p className="text-stone">{line.variant.size} · {line.quantity} × {formatRupiah(line.price)}</p><p className="tabular mt-2">{formatRupiah(line.total)}</p></div></li>)}
          </ul>
          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <Row label="Subtotal produk" value={formatRupiah(subtotal)} />
            <Row label={selectedRate ? `Ongkir · ${selectedRate.courierName} ${selectedRate.serviceName}` : "Ongkir"} value={selectedRate ? formatRupiah(selectedRate.price) : "Pilih kurir"} />
            {selectedRate && <Row label="Estimasi tiba" value={selectedRate.etaLabel ?? `${selectedRate.etdDays.min}–${selectedRate.etdDays.max} hari`} muted />}
            {selectedMethod && <Row label={`Pembayaran · ${selectedMethod.name}`} value={selectedMethod.fee > 0 ? formatRupiah(selectedMethod.fee) : "Gratis"} muted={selectedMethod.fee === 0} />}
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total pembayaran</dt><dd className="tabular">{formatRupiah(total)}</dd></div>
          </dl>
          {region.district && (
            <p className="mt-4 rounded-xl bg-mist p-3 text-xs leading-relaxed text-stone">
              Kirim ke {form.recipientName || form.name || "penerima"} · {[form.line1, region.village?.name, region.district.name, region.regency?.name, region.province?.name, form.postalCode].filter(Boolean).join(", ")}
            </p>
          )}
          {invalidCart && <p role="alert" className="mt-4 text-sm text-danger">Ada produk yang tidak tersedia. Perbarui keranjang sebelum melanjutkan.</p>}
          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
          <Button type="submit" variant="brand" size="lg" block disabled={invalidCart || submitting || !selectedRate || !selectedMethod} className="mt-6">
            {submitting ? "Membuat pesanan…" : selectedMethod?.type === "COD" ? "Buat pesanan COD" : "Lanjut ke pembayaran"}
          </Button>
          <Link href="/shop" className="mt-4 block text-center text-sm underline">Kembali belanja</Link>
        </aside>
      </form>
    </div>
  );
}

function Section({ n, id, title, hint, children }: { n: number; id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <div className="flex items-baseline gap-3 border-b border-line pb-3">
        <span className="tabular text-sm text-stone">0{n}</span>
        <h2 id={`${id}-heading`} className="font-display text-3xl">{title}</h2>
      </div>
      {hint && <p className="mt-3 text-sm text-stone">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className={cn("flex justify-between gap-4", muted && "text-stone")}><dt>{label}</dt><dd className="tabular text-right">{value}</dd></div>;
}

function Field({ label, value, onChange, type = "text", inputMode, autoComplete, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "numeric"; autoComplete?: string; required?: boolean }) {
  return <label className="block text-sm">{label}<input type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} required={required} className={inputClass} /></label>;
}
