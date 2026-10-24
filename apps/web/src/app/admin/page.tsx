import Link from "next/link";
import { ArrowUpRight, Boxes, MessageCircle, Package, ShoppingBag } from "lucide-react";
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
    { label: "Produk & stok", href: "/admin/products" },
    { label: "Pesanan", href: "/admin/orders" },
    { label: "CMS", href: "/admin/content" },
    { label: "Chat pelanggan", href: "/admin/chat" },
  ];
  return <div className="space-y-6">
    <div className="grid grid-cols-2 overflow-hidden border border-[#e6e1d9] bg-white lg:grid-cols-4">{metrics.map((metric, index) => <Link key={metric.label} href={metric.href} className={`group flex min-h-32 flex-col justify-between p-5 transition-colors hover:bg-[#faf7f3] sm:p-6 ${index % 2 === 0 ? "border-r border-[#e6e1d9]" : ""} ${index < 2 ? "border-b border-[#e6e1d9] lg:border-b-0" : ""} ${index === 1 ? "lg:border-r" : ""}`}><div className="flex items-center justify-between"><span className="text-xs font-medium text-stone">{metric.label}</span><metric.icon className="size-4 text-brand" strokeWidth={1.8} /></div><strong className="text-[2.4rem] font-semibold leading-none tracking-[-0.06em] tabular-nums">{metric.value}</strong></Link>)}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(15rem,0.7fr)]">
      <section className="min-w-0 border border-[#e6e1d9] bg-white"><div className="flex h-14 items-center justify-between border-b border-[#e6e1d9] px-5"><h2 className="text-sm font-semibold">Pesanan terbaru</h2><Link href="/admin/orders" className="text-xs font-medium text-brand hover:underline">Lihat semua</Link></div><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-[#faf9f6]"><TableHead className="pl-5">Pesanan</TableHead><TableHead>Pelanggan</TableHead><TableHead>Status</TableHead><TableHead className="pr-5 text-right">Total</TableHead></TableRow></TableHeader><TableBody>{recentOrders.rows.map(({ data: order }) => <TableRow key={order.id}><TableCell className="pl-5 font-medium">{order.orderNumber}</TableCell><TableCell className="text-stone">{order.customer.name}</TableCell><TableCell><Badge tone="muted">{order.status}</Badge></TableCell><TableCell className="pr-5 text-right font-medium tabular-nums">Rp{order.total.toLocaleString("id-ID")}</TableCell></TableRow>)}</TableBody></Table>{!recentOrders.rows.length && <div className="px-5 py-14 text-center text-sm text-stone">Belum ada pesanan.</div>}</div></section>
      <section className="h-fit border border-[#e6e1d9] bg-white"><h2 className="flex h-14 items-center border-b border-[#e6e1d9] px-5 text-sm font-semibold">Akses cepat</h2><div>{actions.map((action) => <Link key={action.href} href={action.href} className="flex h-14 items-center justify-between border-b border-[#eee9e2] px-5 text-sm transition-colors last:border-0 hover:bg-[#faf7f3] hover:text-brand">{action.label}<ArrowUpRight className="size-4" strokeWidth={1.7} /></Link>)}</div></section>
    </div>
  </div>;
}
