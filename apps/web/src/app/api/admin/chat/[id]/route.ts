import { z } from "zod";
import { adminGuard, getAdminUser } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

const message = z.object({ body: z.string().trim().min(1).max(2000) });

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard(); if (denied) return denied;
  const { id } = await params;
  const { rows: conversations } = await getDb().query("SELECT id,customer_name,customer_email FROM chat_conversations WHERE id=$1", [id]);
  if (!conversations[0]) return Response.json({ error: "Percakapan tidak ditemukan" }, { status: 404 });
  const { rows: messages } = await getDb().query("SELECT id,sender_role,body,created_at FROM chat_messages WHERE conversation_id=$1 ORDER BY created_at,id LIMIT 300", [id]);
  return Response.json({ conversation: conversations[0], messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = message.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Pesan harus berisi 1–2000 karakter" }, { status: 400 });
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query("UPDATE chat_conversations SET updated_at=now() WHERE id=$1 RETURNING id", [id]);
    if (!updated.rowCount) { await client.query("ROLLBACK"); return Response.json({ error: "Percakapan tidak ditemukan" }, { status: 404 }); }
    const { rows } = await client.query("INSERT INTO chat_messages (conversation_id,sender_user_id,sender_role,body) VALUES ($1,$2,'ADMIN',$3) RETURNING id,sender_role,body,created_at", [id, admin.id, parsed.data.body]);
    await client.query("COMMIT");
    return Response.json(rows[0], { status: 201 });
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
