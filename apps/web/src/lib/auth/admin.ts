import "server-only";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";

export type AdminRole = "OWNER" | "ADMIN";

export async function getAdminUser() {
  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user) return null;
  const ids = (process.env.ADMIN_USER_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.includes(user.id)) return { ...user, adminRole: "OWNER" as AdminRole };
  const email = user.email.toLowerCase();
  const db = getDb();
  await db.query(
    `UPDATE admin_staff SET user_id=$1 WHERE email=$2 AND user_id IS NULL
       AND EXISTS (SELECT 1 FROM neon_auth."user" WHERE id=$1 AND lower(email)=$2 AND "emailVerified"=true)`,
    [user.id, email],
  );
  const { rows } = await db.query<{ role: AdminRole }>(
    `SELECT s.role FROM admin_staff s JOIN neon_auth."user" u ON u.id=s.user_id
     WHERE s.user_id=$1 AND s.email=$2 AND u."emailVerified"=true`, [user.id, email],
  );
  return rows[0] ? { ...user, adminRole: rows[0].role } : null;
}

export async function adminGuard(): Promise<Response | null> {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!await getAdminUser()) return Response.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function ownerGuard(): Promise<Response | null> {
  const denied = await adminGuard();
  if (denied) return denied;
  const user = await getAdminUser();
  return user?.adminRole === "OWNER" ? null : Response.json({ error: "Owner only" }, { status: 403 });
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/account");
  return user;
}
