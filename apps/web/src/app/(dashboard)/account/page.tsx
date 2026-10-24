import type { Order } from "@fh/types";
import { formatRupiah } from "@fh/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Gift, Heart, MessageCircle, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { OrderStatusPill } from "@/components/account/order-status";
import { VerifyEmail } from "@/components/account/verify-email";
import { ProductCard } from "@/components/product/product-card";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { dbCatalog } from "@/lib/storefront-data";

export const metadata: Metadata = { title: "Akun Saya" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  if (await getAdminUser()) redirect("/admin");
  const [ordersResult, savedResult, catalog] = await Promise.all([
    getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE customer_user_id=$1 ORDER BY created_at DESC LIMIT 200", [data.user.id]),
    getDb().query<{ count: string }>("SELECT count(*)::text AS count FROM account_wishlist WHERE user_id=$1", [data.user.id]),
    dbCatalog.listProducts({ sort: "newest", perPage: 16 }),
  ]);
  const orders = ordersResult.rows.map((row) => row.data);
  const activeShipments = orders.filter((order) => !["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status) && ["READY", "PICKED_UP", "IN_TRANSIT"].includes(order.shipmentStatus));
  const leadShipment = activeShipments[0];
  const points = Math.floor(orders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + order.total, 0) / 10_000);
  const purchasedIds = new Set(orders.flatMap((order) => order.items.map((item) => item.productId)));
  const recommended = catalog.items.filter((product) => !purchasedIds.has(product.id)).slice(0, 4);

  return <div className="space-y-8">
    {!data.user.emailVerified && <VerifyEmail email={data.user.email} />}

    <section aria-label="Ringkasan akun" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { href: "/account/orders", label: "Total pesanan", value: orders.length, icon: ShoppingBag },
        { href: "/account/orders?status=active", label: "Pengiriman aktif", value: activeShipments.length, icon: Truck },
        { href: "/account/wishlist", label: "Wishlist", value: Number(savedResult.rows[0]?.count ?? 0), icon: Heart },
        { href: "/account/help", label: "Poin demo", value: points.toLocaleString("id-ID"), icon: Gift },
      ].map((metric) => <Link key={metric.label} href={metric.href} className="group flex min-h-36 flex-col justify-between rounded-[22px] border border-[#e9e2dc] bg-white p-5 transition-colors hover:border-brand/40 sm:p-6"><div className="flex items-start justify-between gap-3"><span className="text-sm font-medium text-stone">{metric.label}</span><metric.icon className="size-5 text-brand" strokeWidth={1.8} /></div><span className="text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-[#24201e]">{metric.value}</span></Link>)}
    </section>

    {leadShipment && <section className="overflow-hidden rounded-[24px] border border-brand/15 bg-[#f9efef]"><div className="flex flex-wrap items-center gap-3 px-5 py-5 sm:px-7"><span className="flex size-10 items-center justify-center rounded-full bg-brand text-white"><PackageCheck className="size-5" /></span><div className="min-w-0 flex-1"><h2 className="text-[1.05rem] font-semibold">Paket sedang berjalan</h2><p className="text-sm text-stone">{leadShipment.orderNumber} · {leadShipment.courierCode.toUpperCase()} {leadShipment.courierService}</p></div><Link href={`/account/orders/${encodeURIComponent(leadShipment.id)}`} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-press">Lacak paket <ArrowRight className="size-4" /></Link></div></section>}

    <section className="overflow-hidden rounded-[24px] border border-[#e9e2dc] bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-[#eee8e2] px-5 py-5 sm:px-7"><h2 className="text-[1.1rem] font-semibold">Pesanan terbaru</h2><Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">Semua pesanan <ArrowRight className="size-4" /></Link></div>
      {orders.length ? <div className="divide-y divide-[#eee8e2]">{orders.slice(0, 3).map((order) => <div key={order.id} className="flex flex-wrap items-center gap-4 px-5 py-5 sm:flex-nowrap sm:px-7"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2ede7]">{order.items[0]?.imageUrl ? <img src={order.items[0].imageUrl} alt="" className="size-full object-cover" /> : <ShoppingBag className="size-6 text-stone" />}</div><div className="min-w-0 flex-1"><p className="font-semibold">{order.orderNumber}</p><p className="mt-1 truncate text-sm text-stone">{order.items[0]?.productName ?? "Pesanan"}{order.items.length > 1 ? ` +${order.items.length - 1} lainnya` : ""} · {new Date(order.createdAt).toLocaleDateString("id-ID")}</p></div><div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:gap-7"><div className="space-y-2 text-right"><OrderStatusPill order={order} /><p className="text-sm font-semibold tabular-nums">{formatRupiah(order.total)}</p></div><Link href={`/account/orders/${encodeURIComponent(order.id)}`} aria-label={`Lihat pesanan ${order.orderNumber}`} className="flex size-9 items-center justify-center rounded-full border border-[#e7e0d9] text-brand hover:bg-[#f8eeee]"><ArrowRight className="size-4" /></Link></div></div>)}</div> : <div className="px-5 py-14 text-center"><p className="text-stone">Belum ada pesanan.</p><Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">Mulai belanja <ArrowRight className="size-4" /></Link></div>}
    </section>

    <section><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-[1.1rem] font-semibold">Rekomendasi untukmu</h2><Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">Lihat katalog <ArrowRight className="size-4" /></Link></div><div className="grid gap-x-4 gap-y-8 grid-cols-2 xl:grid-cols-4">{recommended.map((product) => <ProductCard key={product.id} product={product} />)}</div>{recommended.length === 0 && <p className="rounded-[22px] border border-[#e9e2dc] bg-white p-8 text-sm text-stone">Produk baru akan muncul di sini.</p>}</section>

    <div className="grid gap-3 sm:grid-cols-2"><Link href="/account/chat" className="flex items-center gap-4 rounded-[22px] border border-[#e9e2dc] bg-white p-5 hover:border-brand/40"><MessageCircle className="size-6 text-brand" /><span className="min-w-0 flex-1"><strong className="block text-sm">Butuh bantuan?</strong><span className="text-sm text-stone">Chat langsung dengan admin</span></span><ArrowRight className="size-4 text-brand" /></Link><Link href="/account/addresses" className="flex items-center gap-4 rounded-[22px] border border-[#e9e2dc] bg-white p-5 hover:border-brand/40"><Truck className="size-6 text-brand" /><span className="min-w-0 flex-1"><strong className="block text-sm">Alamat pengiriman</strong><span className="text-sm text-stone">Atur alamat untuk checkout berikutnya</span></span><ArrowRight className="size-4 text-brand" /></Link></div>
  </div>;
}
