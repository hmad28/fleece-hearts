import type { Order } from "@fh/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";
export default async function CustomerOrdersPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE customer_user_id=$1 ORDER BY created_at DESC LIMIT 100", [data.user.id]);
  return <section className="overflow-hidden border border-[#e6e1d9] bg-white"><div className="flex h-14 items-center justify-between border-b border-[#e6e1d9] px-5"><h2 className="text-sm font-semibold">Semua pesanan</h2><span className="text-xs text-stone">{rows.length}</span></div><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-[#faf9f6]"><TableHead className="pl-5">Pesanan</TableHead><TableHead>Tanggal</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead className="pr-5 text-right" /></TableRow></TableHeader><TableBody>{rows.map(({ data: order }) => <TableRow key={order.id}><TableCell className="pl-5 font-medium">{order.orderNumber}</TableCell><TableCell className="text-stone">{new Date(order.createdAt).toLocaleDateString("id-ID")}</TableCell><TableCell><Badge tone={order.status === "DELIVERED" ? "brand" : "muted"}>{order.status}</Badge></TableCell><TableCell className="font-medium tabular-nums">Rp{order.total.toLocaleString("id-ID")}</TableCell><TableCell className="pr-5 text-right"><Link href={`/account/orders/${encodeURIComponent(order.id)}`} aria-label={`Lihat pesanan ${order.orderNumber}`} className="inline-flex text-brand"><ArrowUpRight className="size-4" /></Link></TableCell></TableRow>)}</TableBody></Table>{rows.length === 0 && <div className="p-12 text-center text-sm text-stone">Belum ada pesanan. <Link href="/shop" className="font-medium text-brand hover:underline">Lihat produk</Link></div>}</div></section>;
}
