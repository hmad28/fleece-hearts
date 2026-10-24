import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const schema = z.object({ productId: z.string().min(1).max(120) });

export async function GET() {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await getDb().query<{ product_id: string }>("SELECT product_id FROM account_wishlist WHERE user_id=$1 ORDER BY created_at DESC", [data.user.id]);
  return Response.json({ productIds: rows.map((row) => row.product_id) });
}

export async function POST(request: Request) {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Produk tidak valid" }, { status: 400 });
  const { rowCount } = await getDb().query(
    `INSERT INTO account_wishlist (user_id, product_id)
     SELECT $1, id FROM catalog_products WHERE id=$2 AND data->>'status'='ACTIVE'
     ON CONFLICT DO NOTHING`, [data.user.id, parsed.data.productId],
  );
  if (!rowCount) {
    const { rows } = await getDb().query("SELECT 1 FROM account_wishlist WHERE user_id=$1 AND product_id=$2", [data.user.id, parsed.data.productId]);
    if (!rows.length) return Response.json({ error: "Produk tidak tersedia" }, { status: 404 });
  }
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Produk tidak valid" }, { status: 400 });
  await getDb().query("DELETE FROM account_wishlist WHERE user_id=$1 AND product_id=$2", [data.user.id, parsed.data.productId]);
  return Response.json({ saved: false });
}
