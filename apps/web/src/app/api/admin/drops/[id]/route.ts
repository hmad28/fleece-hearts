import type { Drop } from "@fh/types";
import { z } from "zod";
import { adminGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

const schema = z.object({
  code: z.string().trim().min(2).max(20),
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200),
  description: z.string().trim().max(2000),
  releaseAt: z.iso.datetime({ offset: true }),
  endAt: z.union([z.iso.datetime({ offset: true }), z.literal("")]),
  productIds: z.array(z.string()).max(100),
  bannerUrl: z.union([z.string().trim().startsWith("/"), z.url().startsWith("https://"), z.literal("")]),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard(); if (denied) return denied;
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { rows } = await getDb().query<{ data: Drop }>("SELECT data FROM catalog_drops WHERE id=$1", [id]);
  const current = rows[0]?.data;
  if (!current) return Response.json({ error: "Drop tidak ditemukan" }, { status: 404 });
  const value = parsed.data;
  const next: Drop = {
    ...current, code: value.code, name: value.name, tagline: value.tagline,
    description: value.description, releaseAt: value.releaseAt, endAt: value.endAt || undefined,
    productIds: value.productIds, banner: { ...current.banner, url: value.bannerUrl || null },
  };
  await getDb().query("UPDATE catalog_drops SET data=$2::jsonb,updated_at=now() WHERE id=$1", [id, JSON.stringify(next)]);
  return Response.json(next);
}
