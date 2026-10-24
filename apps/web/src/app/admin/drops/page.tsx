import type { Drop, Product } from "@fh/types";
import { DropManager } from "@/components/admin/drop-manager";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { PageHeading } from "@/components/admin/page-heading";

export default async function DropsPage() {
  await requireAdmin();
  const db = getDb();
  const [drops, products] = await Promise.all([
    db.query<{ data: Drop }>("SELECT data FROM catalog_drops ORDER BY (data->>'releaseAt')"),
    db.query<{ data: Product }>("SELECT data FROM catalog_products ORDER BY (data->>'name')"),
  ]);
  return <><PageHeading eyebrow="Katalog / Koleksi" title="Drops" description="Jadwalkan rilis, pilih produk, dan atur banner setiap koleksi." /><DropManager initial={drops.rows.map((row) => row.data)} products={products.rows.map((row) => row.data)} /></>;
}
