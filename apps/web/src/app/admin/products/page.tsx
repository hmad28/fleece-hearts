import type { Product } from "@fh/types";
import { ProductManager } from "@/components/admin/product-manager";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export default async function ProductsPage() {
  await requireAdmin();
  const db = getDb();
  const [products, movements] = await Promise.all([
    db.query<{ data: Product }>("SELECT data FROM catalog_products ORDER BY updated_at DESC"),
    db.query<{ product_id: string; variant_id: string; delta: number; stock_after: number; reason: string; created_at: string }>("SELECT product_id,variant_id,delta,stock_after,reason,created_at FROM inventory_movements ORDER BY id DESC LIMIT 30"),
  ]);
  return <><h1 className="font-display text-5xl">Produk & stok</h1><p className="my-5 text-stone">Kelola katalog dan koreksi stok. Setiap koreksi tercatat di riwayat mutasi.</p><ProductManager initial={products.rows.map((row) => row.data)} movements={movements.rows} /></>;
}
