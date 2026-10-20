"use client";

import type { Product } from "@fh/types";
import { formatRupiah } from "@fh/shared";
import { checkoutSchema } from "@fh/validation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { services } from "@/services";
import { useCartStore } from "@/stores/cart-store";

const initialForm = {
  name: "", email: "", phone: "", recipientName: "", recipientPhone: "",
  province: "", city: "", district: "", postalCode: "", line1: "", notes: "",
};
const inputClass = "mt-1 h-12 w-full rounded-xl border border-line bg-paper px-4 outline-none focus:border-ink";

export function CheckoutForm() {
  const router = useRouter();
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [shippingCode, setShippingCode] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => setHydrated(true), []);

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
    queryKey: ["shipping-rates", weightGram, subtotal, form.city, form.district, form.postalCode],
    queryFn: () => services.shipping.getRates({
      destination: { city: form.city, district: form.district, postalCode: form.postalCode },
      weightGram,
      itemValue: subtotal,
    }),
    enabled: hydrated && lines.length > 0 && !invalidCart,
  });
  const methodsQuery = useQuery({ queryKey: ["payment-methods"], queryFn: () => services.payment.listMethods() });
  const rates = ratesQuery.data ?? [];
  const methods = methodsQuery.data ?? [];
  const selectedRate = rates.find((rate) => `${rate.courierCode}:${rate.service}` === shippingCode);
  const selectedMethod = methods.find((method) => method.code === paymentCode);
  const total = subtotal + (selectedRate?.price ?? 0) + (selectedMethod?.fee ?? 0);

  const update = (key: keyof typeof initialForm) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalidCart || !selectedRate || !selectedMethod) {
      setError("Periksa isi keranjang, kurir, dan metode pembayaran.");
      return;
    }
    const result = checkoutSchema.safeParse({
      customer: { name: form.name, email: form.email, phone: form.phone },
      shippingAddress: {
        recipientName: form.recipientName || form.name,
        phone: form.recipientPhone || form.phone,
        province: form.province, city: form.city, district: form.district,
        postalCode: form.postalCode, line1: form.line1, notes: form.notes || undefined,
      },
      items: cartItems.map(({ variantId, quantity }) => ({ variantId, quantity })),
      courierCode: selectedRate.courierCode,
      courierService: selectedRate.service,
      paymentMethodCode: selectedMethod.code,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Periksa kembali formulir checkout.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await services.orders.createOrder(result.data);
      clearCart();
      router.push(`/orders/${order.id}/payment`);
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

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-10 md:px-8 md:pt-16">
      <p className="text-sm text-stone">Keranjang / Checkout / Pembayaran</p>
      <h1 className="font-display mt-3 text-[clamp(3rem,8vw,6rem)]">Checkout</h1>
      <p className="mt-3 text-stone">Simulasi pembelian. Tidak ada pembayaran sungguhan.</p>
      <form onSubmit={submit} className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] lg:gap-20">
        <div className="space-y-10">
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="font-display text-3xl">Kontak</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nama" value={form.name} onChange={update("name")} required />
              <Field label="Nomor WhatsApp" value={form.phone} onChange={update("phone")} type="tel" required />
              <div className="sm:col-span-2"><Field label="Email untuk cek order" value={form.email} onChange={update("email")} type="email" required /></div>
            </div>
          </section>
          <section aria-labelledby="address-heading">
            <h2 id="address-heading" className="font-display text-3xl">Alamat pengiriman</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nama penerima (opsional jika sama)" value={form.recipientName} onChange={update("recipientName")} />
              <Field label="HP penerima (opsional jika sama)" value={form.recipientPhone} onChange={update("recipientPhone")} type="tel" />
              <Field label="Provinsi" value={form.province} onChange={update("province")} required />
              <Field label="Kota / kabupaten" value={form.city} onChange={update("city")} required />
              <Field label="Kecamatan" value={form.district} onChange={update("district")} required />
              <Field label="Kode pos" value={form.postalCode} onChange={update("postalCode")} inputMode="numeric" required />
              <div className="sm:col-span-2"><Field label="Alamat lengkap" value={form.line1} onChange={update("line1")} required /></div>
              <label className="text-sm sm:col-span-2">Catatan pesanan (opsional)
                <textarea value={form.notes} onChange={(event) => update("notes")(event.target.value)} rows={3} maxLength={200} className="mt-1 w-full rounded-xl border border-line bg-paper p-4 outline-none focus:border-ink" placeholder="Patokan rumah atau instruksi kurir" />
              </label>
            </div>
          </section>
          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="font-display text-3xl">Pengiriman</h2>
            <p className="mt-1 text-sm text-stone">Ongkir simulasi berdasarkan berat. Pilihan kurir mengubah total pembayaran.</p>
            <div className="mt-4 space-y-2">
              {ratesQuery.isLoading && <p className="text-stone">Menghitung ongkir…</p>}
              {rates.map((rate) => {
                const code = `${rate.courierCode}:${rate.service}`;
                return <label key={code} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4 has-checked:border-ink"><input type="radio" name="shipping" value={code} checked={shippingCode === code} onChange={() => setShippingCode(code)} required /><span className="flex-1">{rate.courierName} {rate.serviceName}<span className="block text-xs text-stone">Estimasi {rate.etdDays.min}–{rate.etdDays.max} hari</span></span><span className="tabular text-sm">{formatRupiah(rate.price)}</span></label>;
              })}
            </div>
          </section>
          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="font-display text-3xl">Metode pembayaran</h2>
            <div className="mt-4 space-y-2">
              {methods.map((method) => <label key={method.code} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4 has-checked:border-ink"><input type="radio" name="payment" value={method.code} checked={paymentCode === method.code} onChange={() => setPaymentCode(method.code)} required /><span className="flex-1">{method.name}</span><span className="text-xs text-stone">Simulasi</span></label>)}
            </div>
          </section>
        </div>
        <aside className="h-fit border-t border-ink pt-5 lg:sticky lg:top-24" aria-label="Ringkasan belanja">
          <h2 className="font-display text-3xl">Ringkasan belanja</h2>
          <ul className="mt-5 divide-y divide-line">
            {lines.map((line) => <li key={line.variant.id} className="flex gap-4 py-4"><Media asset={line.product.images[0] ?? { url: null, alt: line.product.name }} sizes="72px" className="aspect-[4/5] w-[72px] shrink-0" /><div className="min-w-0 flex-1 text-sm"><p>{line.product.name} – {line.product.colorway}</p><p className="text-stone">{line.variant.size} · {line.quantity} × {formatRupiah(line.price)}</p><p className="tabular mt-2">{formatRupiah(line.total)}</p></div></li>)}
          </ul>
          <dl className="space-y-2 border-t border-line pt-4 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatRupiah(subtotal)}</dd></div><div className="flex justify-between"><dt>Ongkir</dt><dd>{selectedRate ? formatRupiah(selectedRate.price) : "Pilih kurir"}</dd></div>{selectedMethod && selectedMethod.fee > 0 && <div className="flex justify-between"><dt>Biaya pembayaran</dt><dd>{formatRupiah(selectedMethod.fee)}</dd></div>}<div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total pembayaran</dt><dd className="tabular">{formatRupiah(total)}</dd></div></dl>
          {invalidCart && <p role="alert" className="mt-4 text-sm text-danger">Ada produk yang tidak tersedia. Perbarui keranjang sebelum melanjutkan.</p>}
          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
          <Button type="submit" variant="brand" size="lg" block disabled={invalidCart || submitting || !selectedRate || !selectedMethod} className="mt-6">{submitting ? "Membuat pesanan…" : "Lanjut ke pembayaran"}</Button>
          <Link href="/shop" className="mt-4 block text-center text-sm underline">Kembali belanja</Link>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", inputMode, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "numeric"; required?: boolean }) {
  return <label className="block text-sm">{label}<input type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} required={required} className={inputClass} /></label>;
}
