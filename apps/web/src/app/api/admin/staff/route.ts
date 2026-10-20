import { z } from "zod";
import { getAdminUser, ownerGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

const schema = z.object({ email: z.email(), role: z.enum(["OWNER", "ADMIN"]) });

export async function GET() {
  const denied = await ownerGuard(); if (denied) return denied;
  const { rows } = await getDb().query("SELECT email,role,user_id,created_at FROM admin_staff ORDER BY created_at");
  return Response.json(rows);
}

export async function POST(request: Request) {
  const denied = await ownerGuard(); if (denied) return denied;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Email atau peran tidak valid" }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const db = getDb();
  const { rows: existing } = await db.query<{ role: string }>("SELECT role FROM admin_staff WHERE email=$1", [email]);
  if (existing[0]?.role === "OWNER" && parsed.data.role === "ADMIN") {
    const { rows: owners } = await db.query<{ count: string }>("SELECT count(*)::text AS count FROM admin_staff WHERE role='OWNER'");
    if (Number(owners[0]?.count ?? 0) <= 1) return Response.json({ error: "Owner terakhir tidak dapat diturunkan" }, { status: 400 });
  }
  const { rows: users } = await db.query<{ id: string }>('SELECT id FROM neon_auth."user" WHERE lower(email)=$1 AND "emailVerified"=true', [email]);
  if (!users[0]) return Response.json({ error: "Akun Neon Auth belum ada atau email belum terverifikasi" }, { status: 400 });
  const actor = await getAdminUser();
  const { rows } = await db.query(
    `INSERT INTO admin_staff (email,user_id,role,created_by) VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO UPDATE SET user_id=EXCLUDED.user_id,role=EXCLUDED.role
     RETURNING email,role,user_id,created_at`, [email, users[0].id, parsed.data.role, actor!.id],
  );
  return Response.json(rows[0]);
}
