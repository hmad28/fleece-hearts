import type { Product } from "@fh/types";
import { adminGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { productInput } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const denied = await adminGuard(); if (denied) return denied;
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = productInput.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ data: Product }>("SELECT data FROM catalog_products WHERE id = $1 FOR UPDATE", [id]);
    const current = rows[0]?.data;
    if (!current) { await client.query("ROLLBACK"); return Response.json({ error: "Produk tidak ditemukan" }, { status: 404 }); }
    const input = parsed.data;
    const existing = new Map(current.variants.map((variant) => [variant.id, variant]));
    if (input.variants.length !== current.variants.length || input.variants.some((variant) => !variant.id || !existing.has(variant.id))) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Gunakan penyesuaian stok untuk mengubah jumlah. Varian produk lama tidak dapat dihapus." }, { status: 400 });
    }
    const next: Product = {
      ...current, slug: input.slug, name: input.name, colorway: input.colorway,
      description: input.description, material: input.material, price: input.price,
      categoryId: input.categoryId, weightGram: input.weightGram, status: input.status,
      isFeatured: input.isFeatured,
      images: [{ id: current.images[0]?.id ?? `${id}_img1`, url: input.imageUrl || null, alt: `${input.name} – ${input.colorway}`, position: 0 }, ...current.images.slice(1)],
      variants: input.variants.map((variant) => ({ ...existing.get(variant.id!)!, sku: variant.sku, size: variant.size, color: variant.color, status: variant.status })),
    };
    await client.query("UPDATE catalog_products SET slug=$2, data=$3::jsonb, updated_at=now() WHERE id=$1", [id, next.slug, JSON.stringify(next)]);
    await client.query("COMMIT");
    return Response.json(next);
  } catch (error) {
    await client.query("ROLLBACK");
    if ((error as { code?: string }).code === "23505") return Response.json({ error: "Slug sudah dipakai" }, { status: 409 });
    throw error;
  } finally { client.release(); }
}
