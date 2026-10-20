import { getAdminUser, ownerGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ email: string }> }) {
  const denied = await ownerGuard(); if (denied) return denied;
  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail).toLowerCase();
  const actor = await getAdminUser();
  const db = getDb();
  const { rows: owners } = await db.query<{ count: string }>("SELECT count(*)::text AS count FROM admin_staff WHERE role='OWNER'");
  const { rows: target } = await db.query<{ role: string; user_id: string | null }>("SELECT role,user_id FROM admin_staff WHERE email=$1", [email]);
  if (!target[0]) return Response.json({ error: "Staf tidak ditemukan" }, { status: 404 });
  if (target[0].role === "OWNER" && Number(owners[0]?.count ?? 0) <= 1) return Response.json({ error: "Owner terakhir tidak dapat dihapus" }, { status: 400 });
  if (target[0].user_id === actor?.id) return Response.json({ error: "Akun yang sedang dipakai tidak dapat dihapus" }, { status: 400 });
  await db.query("DELETE FROM admin_staff WHERE email=$1", [email]);
  return Response.json({ ok: true });
}
