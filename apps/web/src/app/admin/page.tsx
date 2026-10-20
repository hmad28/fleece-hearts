import Link from "next/link";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminPage() {
  await requireAdmin();
  const db = getDb();
  const [products, orders, conversations, movements] = await Promise.all([
    db.query<{ count: string; low_stock: string }>(`SELECT count(*)::text AS count, count(*) FILTER (WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(data->'variants') v WHERE (v->>'available')::int < 5))::text AS low_stock FROM catalog_products`),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM demo_orders"),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM chat_conversations"),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM inventory_movements"),
  ]);
  const cards = [
    { label: "Produk", value: products.rows[0]?.count ?? "0", href: "/admin/products" },
    { label: "Produk stok < 5", value: products.rows[0]?.low_stock ?? "0", href: "/admin/products" },
    { label: "Pesanan demo", value: orders.rows[0]?.count ?? "0", href: "/admin/orders" },
    { label: "Percakapan", value: conversations.rows[0]?.count ?? "0", href: "/admin/chat" },
    { label: "Mutasi stok", value: movements.rows[0]?.count ?? "0", href: "/admin/products" },
  ];
  return <><p className="text-sm uppercase tracking-widest text-stone">Operasional toko</p><h1 className="font-display mt-3 text-5xl">Ringkasan</h1><p className="mt-4 text-stone">Angka pesanan berasal dari simulasi checkout. Pembayaran dan pengiriman belum terhubung provider sungguhan.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <Link href={card.href} key={card.label} className="rounded-2xl border border-line p-6 hover:bg-mist"><p className="text-sm text-stone">{card.label}</p><p className="font-display mt-3 text-5xl tabular">{card.value}</p></Link>)}</div></>;
}
