import type { Order } from "@fh/types";
import { OrderManager } from "@/components/admin/order-manager";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { PageHeading } from "@/components/admin/page-heading";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders ORDER BY created_at DESC LIMIT 200");
  return <><PageHeading eyebrow="Operasional / Pesanan" title="Manajemen pesanan" description="Pantau pembelian, perbarui status, dan kelola pengiriman dari satu tempat." /><OrderManager initial={rows.map((row) => row.data)} /></>;
}
