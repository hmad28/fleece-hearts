import Link from "next/link";
import { ArrowUpRight, Boxes, MessageCircle, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const db = getDb();
  const [products, orders, conversations, movements, recentOrders] = await Promise.all([
    db.query<{ count: string; low_stock: string }>(`SELECT count(*)::text AS count, count(*) FILTER (WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(data->'variants') v WHERE (v->>'available')::int < 5))::text AS low_stock FROM catalog_products`),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM demo_orders"),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM chat_conversations"),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM inventory_movements"),
    db.query<{ data: { id: string; orderNumber: string; customer: { name: string }; status: string; total: number; createdAt: string } }>("SELECT data FROM demo_orders ORDER BY created_at DESC LIMIT 5"),
  ]);
  const stats = [
    { label: "Produk aktif", value: products.rows[0]?.count ?? "0", detail: "Dalam katalog", href: "/admin/products", icon: Package },
    { label: "Perlu cek stok", value: products.rows[0]?.low_stock ?? "0", detail: "Varian di bawah 5 pcs", href: "/admin/products", icon: Boxes },
    { label: "Total pesanan", value: orders.rows[0]?.count ?? "0", detail: "Pesanan simulasi", href: "/admin/orders", icon: ShoppingBag },
    { label: "Percakapan", value: conversations.rows[0]?.count ?? "0", detail: "Masuk ke inbox", href: "/admin/chat", icon: MessageCircle },
  ];
  const shortcuts = [
    { title: "Kelola katalog", description: "Produk, varian, dan stok", href: "/admin/products", icon: Package },
    { title: "Ubah konten", description: "Beranda dan promosi", href: "/admin/content", icon: TrendingUp },
    { title: "Lihat inbox", description: "Balas pertanyaan pelanggan", href: "/admin/chat", icon: MessageCircle },
  ];
  return <div>
    <PageHeading eyebrow="Studio / Overview" title="Selamat datang kembali" description={`Halo, ${admin.email}. Berikut kondisi toko dan pekerjaan yang bisa langsung kamu lanjutkan.`} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => <Link key={stat.label} href={stat.href} className="group">
        <Card className="h-full gap-5 border-line bg-white py-5 shadow-none transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between px-5"><CardDescription className="font-medium">{stat.label}</CardDescription><span className="rounded-lg bg-brand/8 p-2 text-brand"><stat.icon className="size-4" /></span></CardHeader>
          <CardContent className="px-5"><strong className="text-4xl font-semibold tracking-tight tabular-nums">{stat.value}</strong><p className="mt-1.5 text-xs text-stone">{stat.detail}</p></CardContent>
        </Card>
      </Link>)}
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
      <Card className="gap-0 border-line bg-white py-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b border-line py-5"><div><CardTitle className="text-base">Pesanan terbaru</CardTitle><CardDescription className="mt-1">Aktivitas pembelian paling baru</CardDescription></div><Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-brand">Semua pesanan <ArrowUpRight className="size-3.5" /></Link></CardHeader>
        <CardContent className="px-0">
          {recentOrders.rows.length ? recentOrders.rows.map(({ data: order }) => <Link href="/admin/orders" key={order.id} className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4 last:border-b-0 hover:bg-muted/60 sm:flex-nowrap">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mist text-brand"><ShoppingBag className="size-4" /></span>
            <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{order.orderNumber}</strong><small className="block truncate text-stone">{order.customer.name}</small></span>
            <Badge tone="muted">{order.status}</Badge><strong className="min-w-28 text-right text-sm tabular-nums">Rp{order.total.toLocaleString("id-ID")}</strong>
          </Link>) : <div className="p-10 text-center"><ShoppingBag className="mx-auto size-8 text-stone/50" /><p className="mt-3 text-sm font-medium">Belum ada pesanan</p><p className="mt-1 text-xs text-stone">Pesanan baru akan tampil di sini.</p></div>}
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card className="gap-4 border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Akses cepat</CardTitle><CardDescription>Lanjutkan pekerjaan utama</CardDescription></CardHeader><CardContent className="space-y-1">{shortcuts.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"><span className="rounded-lg bg-brand/8 p-2 text-brand"><item.icon className="size-4" /></span><span className="flex-1"><strong className="block text-sm">{item.title}</strong><small className="text-stone">{item.description}</small></span><ArrowUpRight className="size-4 text-stone" /></Link>)}</CardContent></Card>
        <Card className="gap-2 border-brand/15 bg-brand/5 shadow-none"><CardHeader><CardTitle className="text-base">Catatan operasional</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-stone"><strong className="text-ink">{movements.rows[0]?.count ?? "0"} mutasi stok</strong> sudah tercatat. Pembayaran dan pengiriman di situs saat ini berjalan dalam mode simulasi.</CardContent></Card>
      </div>
    </div>
  </div>;
}
