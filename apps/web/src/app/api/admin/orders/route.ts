import type { Order } from "@fh/types";
import { adminGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  const { rows } = await getDb().query<{ data: Order; customer_user_id: string }>("SELECT data,customer_user_id FROM demo_orders ORDER BY created_at DESC LIMIT 200");
  return Response.json(rows.map((row) => ({ ...row.data, customerUserId: row.customer_user_id })));
}
