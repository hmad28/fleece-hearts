import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const message = z.object({ body: z.string().trim().min(1).max(2000) });

export async function GET() {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const { rows: conversations } = await db.query("SELECT id FROM chat_conversations WHERE customer_user_id=$1", [data.user.id]);
  const conversationId = conversations[0]?.id;
  const { rows: messages } = conversationId
    ? await db.query("SELECT id,sender_role,body,created_at FROM chat_messages WHERE conversation_id=$1 ORDER BY created_at,id LIMIT 300", [conversationId])
    : { rows: [] };
  return Response.json({ conversationId: conversationId ?? null, messages });
}

export async function POST(request: Request) {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = message.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Pesan harus berisi 1–2000 karakter" }, { status: 400 });
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO chat_conversations (customer_user_id,customer_email,customer_name)
       VALUES ($1,$2,$3) ON CONFLICT (customer_user_id) DO UPDATE SET updated_at=now()
       RETURNING id`, [data.user.id, data.user.email, data.user.name],
    );
    const { rows: sent } = await client.query(
      "INSERT INTO chat_messages (conversation_id,sender_user_id,sender_role,body) VALUES ($1,$2,'CUSTOMER',$3) RETURNING id,sender_role,body,created_at",
      [rows[0]!.id, data.user.id, parsed.data.body],
    );
    await client.query("COMMIT");
    return Response.json(sent[0], { status: 201 });
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
