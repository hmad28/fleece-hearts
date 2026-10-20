import { adminGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  const { rows } = await getDb().query("SELECT product_id, variant_id, delta, stock_after, reason, actor_user_id, created_at FROM inventory_movements ORDER BY id DESC LIMIT 100");
  return Response.json(rows);
}
