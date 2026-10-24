import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80),
  phone: z.string().trim().max(24).refine((value) => !value || /^\+?[\d\s()-]{8,24}$/.test(value), "Nomor HP tidak valid"),
});

export async function GET() {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await getDb().query<{ first_name: string; last_name: string; phone: string }>(
    "SELECT first_name, last_name, phone FROM account_profiles WHERE user_id=$1", [data.user.id],
  );
  const fallback = (data.user.name ?? "").trim().split(/\s+/);
  return Response.json({ firstName: rows[0]?.first_name ?? fallback[0] ?? "", lastName: rows[0]?.last_name ?? fallback.slice(1).join(" "), phone: rows[0]?.phone ?? "", email: data.user.email });
}

export async function PUT(request: Request) {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Profil tidak valid" }, { status: 400 });
  const { firstName, lastName, phone } = parsed.data;
  await getDb().query(
    `INSERT INTO account_profiles (user_id, first_name, last_name, phone) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE SET first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,phone=EXCLUDED.phone,updated_at=now()`,
    [data.user.id, firstName, lastName, phone],
  );
  return Response.json({ firstName, lastName, phone, email: data.user.email });
}
