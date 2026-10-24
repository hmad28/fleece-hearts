import { z } from "zod";
import { adminGuard } from "@/lib/auth/admin";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getSiteContent } from "@/lib/site-content";

const schema = z.object({
  announcement: z.string().trim().max(180),
  promotionImageUrl: z.string().trim().max(2000).refine((value) => value.startsWith("/") && !value.startsWith("//") || /^https:\/\//.test(value), "URL gambar promosi tidak valid"),
  promotionEnabled: z.boolean(),
  heroEyebrow: z.string().trim().max(100),
  heroBody: z.string().trim().max(500),
  showLatest: z.boolean(), showLookbook: z.boolean(),
  showMaterial: z.boolean(), showCategories: z.boolean(),
  whatsappNumber: z.string().trim().max(30).refine((value) => value === "" || /^\+?[\d\s()-]{8,30}$/.test(value) && value.replace(/\D/g, "").length >= 10, "Nomor WhatsApp tidak valid"),
  instagramUrl: z.string().trim().max(300).refine((value) => {
    if (!value) return true;
    try { const url = new URL(value); return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname); } catch { return false; }
  }, "URL Instagram tidak valid"),
  tiktokUrl: z.string().trim().max(300).refine((value) => {
    if (!value) return true;
    try { const url = new URL(value); return url.protocol === "https:" && ["tiktok.com", "www.tiktok.com"].includes(url.hostname); } catch { return false; }
  }, "URL TikTok tidak valid"),
  contactEmail: z.email().max(300).or(z.literal("")).default(""),
  location: z.string().trim().max(300).default(""),
  description: z.string().trim().max(500).default(""),
});

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  return Response.json(await getSiteContent());
}

export async function PUT(request: Request) {
  const denied = await adminGuard(); if (denied) return denied;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Konten tidak valid" }, { status: 400 });
  const { data } = await auth.getSession();
  await getDb().query(
    `INSERT INTO site_content (key,data,updated_by) VALUES ('home',$1::jsonb,$2)
     ON CONFLICT (key) DO UPDATE SET data=EXCLUDED.data,updated_by=EXCLUDED.updated_by,updated_at=now()`,
    [JSON.stringify(parsed.data), data!.user!.id],
  );
  return Response.json(parsed.data);
}
