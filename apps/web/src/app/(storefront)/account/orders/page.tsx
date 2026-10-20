import type { Order } from "@fh/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE customer_user_id=$1 ORDER BY created_at DESC LIMIT 100", [data.user.id]);
  return <main className="mx-auto max-w-4xl px-4 py-16"><Link href="/account" className="text-sm underline">← Akun saya</Link><h1 className="font-display my-8 text-5xl">Pesanan saya</h1><p className="mb-8 text-stone">Riwayat ini memuat pesanan simulasi yang dibuat saat Anda masuk akun.</p><div className="space-y-4">{rows.map(({ data: order }) => <article key={order.id} className="rounded-2xl border border-line p-5"><div className="flex justify-between gap-4"><strong>{order.orderNumber}</strong><span>{order.status}</span></div><p className="mt-2 text-sm text-stone">{new Date(order.createdAt).toLocaleDateString("id-ID")} · {order.items.length} produk</p><p className="mt-2">Rp{order.total.toLocaleString("id-ID")}</p><Link href={`/account/orders/${encodeURIComponent(order.id)}`} className="mt-3 inline-block text-sm underline">Lihat detail & pelacakan</Link></article>)}{rows.length === 0 && <p>Belum ada pesanan. <Link href="/shop" className="underline">Jelajahi produk</Link></p>}</div></main>;
}
