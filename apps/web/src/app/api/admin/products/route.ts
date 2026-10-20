import type { Product } from "@fh/types";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { adminGuard } from "@/lib/auth/admin";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export const productInput = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  colorway: z.string().trim().max(80),
  description: z.string().trim().min(10).max(3000),
  material: z.string().trim().max(500),
  price: z.number().int().min(0).max(100_000_000),
  categoryId: z.string().trim().min(1),
  weightGram: z.number().int().min(1).max(100_000),
  imageUrl: z.union([z.string().trim().startsWith("/"), z.url().startsWith("https://"), z.literal("")]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isFeatured: z.boolean(),
  variants: z.array(z.object({
    id: z.string().optional(),
    sku: z.string().trim().min(1).max(80),
    size: z.string().trim().min(1).max(40),
    color: z.string().trim().max(80),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    available: z.number().int().min(0).max(1_000_000),
  })).min(1).max(30),
});

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  const { rows } = await getDb().query<{ data: Product }>("SELECT data FROM catalog_products ORDER BY updated_at DESC");
  return Response.json(rows.map((row) => row.data));
}

export async function POST(request: Request) {
  const denied = await adminGuard(); if (denied) return denied;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = productInput.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const input = parsed.data;
  const id = `p_${randomUUID()}`;
  const now = new Date().toISOString();
  const product: Product = {
    id, slug: input.slug, name: input.name, colorway: input.colorway,
    description: input.description, material: input.material, careInstructions: [],
    price: input.price, categoryId: input.categoryId, collectionIds: [],
    images: [{ id: `${id}_img1`, url: input.imageUrl || null, alt: `${input.name} – ${input.colorway}`, position: 0 }],
    variants: input.variants.map((variant) => ({
      id: `${id}_${randomUUID()}`, productId: id, sku: variant.sku,
      size: variant.size, color: variant.color, available: variant.available, status: variant.status,
    })),
    weightGram: input.weightGram, status: input.status, isFeatured: input.isFeatured,
    createdAt: now, isDummy: false,
  };
  const { data } = await auth.getSession();
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO catalog_products (id, slug, data) VALUES ($1,$2,$3::jsonb)", [id, product.slug, JSON.stringify(product)]);
    for (const variant of product.variants) {
      await client.query("INSERT INTO inventory_movements (product_id, variant_id, delta, stock_after, reason, actor_user_id) VALUES ($1,$2,$3,$3,$4,$5)", [id, variant.id, variant.available, "Stok awal", data!.user!.id]);
    }
    await client.query("COMMIT");
    return Response.json(product, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    if ((error as { code?: string }).code === "23505") return Response.json({ error: "Slug atau SKU sudah dipakai" }, { status: 409 });
    throw error;
  } finally { client.release(); }
}
