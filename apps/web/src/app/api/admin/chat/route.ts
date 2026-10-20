import { adminGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  const { rows } = await getDb().query(
    `SELECT c.id,c.customer_name,c.customer_email,c.updated_at,
       (SELECT body FROM chat_messages WHERE conversation_id=c.id ORDER BY created_at DESC,id DESC LIMIT 1) AS last_message
     FROM chat_conversations c ORDER BY c.updated_at DESC LIMIT 100`,
  );
  return Response.json(rows);
}
