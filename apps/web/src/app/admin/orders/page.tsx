import type { Order } from "@fh/types";
import { OrderManager } from "@/components/admin/order-manager";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders ORDER BY created_at DESC LIMIT 200");
  return <><h1 className="font-display text-5xl">Pesanan demo</h1><p className="my-5 text-stone">Status operasional untuk pesanan simulasi. Perubahan tersimpan di database; pembayaran masih simulasi.</p><OrderManager initial={rows.map((row) => row.data)} /></>;
}
