import type { Drop } from "@fh/types";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { adminGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  const { rows } = await getDb().query<{ data: Drop }>("SELECT data FROM catalog_drops ORDER BY (data->>'releaseAt')");
  return Response.json(rows.map((row) => row.data));
}

const schema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  code: z.string().trim().min(2).max(20), name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200), description: z.string().trim().max(2000),
  releaseAt: z.iso.datetime({ offset: true }), endAt: z.union([z.iso.datetime({ offset: true }), z.literal("")]),
  productIds: z.array(z.string()).max(100),
  bannerUrl: z.union([z.string().trim().startsWith("/"), z.url().startsWith("https://"), z.literal("")]),
});

export async function POST(request: Request) {
  const denied = await adminGuard(); if (denied) return denied;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const input = parsed.data;
  const id = `drop_${randomUUID()}`;
  const drop: Drop = { id, slug: input.slug, code: input.code, name: input.name, tagline: input.tagline, description: input.description,
    banner: { id: `${id}_banner`, url: input.bannerUrl || null, alt: input.name, width: 1376, height: 768 },
    releaseAt: input.releaseAt, endAt: input.endAt || undefined, productIds: input.productIds, isDummy: false };
  try {
    await getDb().query("INSERT INTO catalog_drops (id,slug,data) VALUES ($1,$2,$3::jsonb)", [id, drop.slug, JSON.stringify(drop)]);
    return Response.json(drop, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return Response.json({ error: "Slug drop sudah dipakai" }, { status: 409 });
    throw error;
  }
}
