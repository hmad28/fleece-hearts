import Link from "next/link";
import { ArrowUpRight, Boxes, Images, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminPage() {
  await requireAdmin();
  const db = getDb();
  const [products, orders, conversations, recentOrders] = await Promise.all([
    db.query<{ count: string; low_stock: string }>(`SELECT count(*)::text AS count, count(*) FILTER (WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(data->'variants') v WHERE (v->>'available')::int < 5))::text AS low_stock FROM catalog_products`),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM demo_orders"),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM chat_conversations"),
    db.query<{ data: { id: string; orderNumber: string; customer: { name: string }; status: string; total: number; createdAt: string } }>("SELECT data FROM demo_orders ORDER BY created_at DESC LIMIT 8"),
  ]);
  const metrics = [
    { label: "Produk", value: products.rows[0]?.count ?? "0", href: "/admin/products", icon: Package },
    { label: "Stok rendah", value: products.rows[0]?.low_stock ?? "0", href: "/admin/products", icon: Boxes },
    { label: "Pesanan", value: orders.rows[0]?.count ?? "0", href: "/admin/orders", icon: ShoppingBag },
    { label: "Chat", value: conversations.rows[0]?.count ?? "0", href: "/admin/chat", icon: MessageCircle },
  ];
  const actions = [
    { label: "Produk & stok", href: "/admin/products", icon: Package },
    { label: "Pesanan", href: "/admin/orders", icon: ShoppingBag },
    { label: "CMS", href: "/admin/content", icon: Images },
    { label: "Chat pelanggan", href: "/admin/chat", icon: MessageCircle },
  ];
  return <div className="space-y-7">
    <section aria-label="Ringkasan toko" className="grid w-full overflow-hidden rounded-[28px] border border-[#e8e0d8] bg-white shadow-[0_18px_55px_-45px_rgba(65,30,30,0.38)] sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => <Link key={metric.label} href={metric.href} className={`group flex min-h-44 flex-col justify-between gap-8 p-6 transition-colors hover:bg-[#fbf7f4] sm:p-8 ${index < 3 ? "border-b border-[#eee8e0] xl:border-b-0 xl:border-r" : ""} ${index === 0 || index === 2 ? "sm:border-r" : ""} ${index === 1 ? "sm:border-r-0 xl:border-r" : ""} ${index === 2 ? "sm:border-b-0" : ""}`}>
        <div className="flex items-center justify-between gap-4"><span className="text-base font-medium text-stone">{metric.label}</span><span className="flex size-12 items-center justify-center rounded-2xl bg-[#f5e9e7] text-brand"><metric.icon className="size-6" strokeWidth={1.8} /></span></div>
        <strong className="text-[2.5rem] font-semibold leading-none tracking-[-0.055em] tabular-nums sm:text-[3rem]">{metric.value}</strong>
      </Link>)}
    </section>

    <section className="w-full overflow-hidden rounded-[28px] border border-[#e8e0d8] bg-white shadow-[0_18px_55px_-45px_rgba(65,30,30,0.38)]">
      <div className="flex min-h-20 items-center justify-between gap-4 border-b border-[#eee8e0] px-6 sm:px-8"><h2 className="text-[1.15rem] font-semibold tracking-tight">Pesanan terbaru</h2><Link href="/admin/orders" className="inline-flex items-center gap-2 text-base font-medium text-brand hover:underline">Lihat semua <ArrowUpRight className="size-5" /></Link></div>
      <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-[#fbfaf8]"><TableHead className="h-14 pl-6 text-sm sm:pl-8">Pesanan</TableHead><TableHead className="text-sm">Pelanggan</TableHead><TableHead className="text-sm">Status</TableHead><TableHead className="pr-6 text-right text-sm sm:pr-8">Total</TableHead></TableRow></TableHeader><TableBody>{recentOrders.rows.map(({ data: order }) => <TableRow key={order.id} className="h-16"><TableCell className="pl-6 text-base font-semibold sm:pl-8">{order.orderNumber}</TableCell><TableCell className="text-base text-stone">{order.customer.name}</TableCell><TableCell><Badge tone="muted" className="px-3 py-1 text-sm">{order.status}</Badge></TableCell><TableCell className="pr-6 text-right text-base font-semibold tabular-nums sm:pr-8">Rp{order.total.toLocaleString("id-ID")}</TableCell></TableRow>)}</TableBody></Table>{!recentOrders.rows.length && <div className="px-6 py-16 text-center text-base text-stone">Belum ada pesanan.</div>}</div>
    </section>

    <section className="w-full overflow-hidden rounded-[28px] border border-[#e8e0d8] bg-white shadow-[0_18px_55px_-45px_rgba(65,30,30,0.38)]">
      <h2 className="flex min-h-20 items-center border-b border-[#eee8e0] px-6 text-xl font-semibold tracking-tight sm:px-8">Akses cepat</h2>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">{actions.map((action, index) => <Link key={action.href} href={action.href} className={`group flex min-h-24 items-center gap-4 px-6 text-base font-semibold transition-colors hover:bg-[#fbf7f4] hover:text-brand sm:px-8 ${index < 3 ? "border-b border-[#eee8e0] xl:border-b-0 xl:border-r" : ""} ${index === 0 || index === 2 ? "sm:border-r" : ""} ${index === 1 ? "sm:border-r-0 xl:border-r" : ""} ${index === 2 ? "sm:border-b-0" : ""}`}><action.icon className="size-6 shrink-0 text-brand" strokeWidth={1.8} /><span className="flex-1">{action.label}</span><ArrowUpRight className="size-5 shrink-0 text-stone transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" /></Link>)}</div>
    </section>
  </div>;
}
