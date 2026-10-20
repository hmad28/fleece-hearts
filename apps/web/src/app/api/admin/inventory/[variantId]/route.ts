import type { Product } from "@fh/types";
import { z } from "zod";
import { adminGuard } from "@/lib/auth/admin";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const adjustment = z.object({ delta: z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0), reason: z.string().trim().min(3).max(300) });

export async function POST(request: Request, { params }: { params: Promise<{ variantId: string }> }) {
  const denied = await adminGuard(); if (denied) return denied;
  const { variantId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = adjustment.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Jumlah atau alasan tidak valid" }, { status: 400 });
  const { data } = await auth.getSession();
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string; data: Product }>("SELECT id, data FROM catalog_products WHERE data @> $1::jsonb FOR UPDATE", [JSON.stringify({ variants: [{ id: variantId }] })]);
    const row = rows[0];
    if (!row) { await client.query("ROLLBACK"); return Response.json({ error: "Varian tidak ditemukan" }, { status: 404 }); }
    const variant = row.data.variants.find((item) => item.id === variantId)!;
    const after = variant.available + parsed.data.delta;
    if (after < 0) { await client.query("ROLLBACK"); return Response.json({ error: "Stok tidak boleh negatif" }, { status: 400 }); }
    const next = { ...row.data, variants: row.data.variants.map((item) => item.id === variantId ? { ...item, available: after } : item) };
    await client.query("UPDATE catalog_products SET data=$2::jsonb, updated_at=now() WHERE id=$1", [row.id, JSON.stringify(next)]);
    await client.query("INSERT INTO inventory_movements (product_id, variant_id, delta, stock_after, reason, actor_user_id) VALUES ($1,$2,$3,$4,$5,$6)", [row.id, variantId, parsed.data.delta, after, parsed.data.reason, data!.user!.id]);
    await client.query("COMMIT");
    return Response.json({ variantId, available: after });
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
