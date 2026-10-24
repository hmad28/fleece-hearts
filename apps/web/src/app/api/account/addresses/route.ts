import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const fields = z.object({
  label: z.string().trim().min(1).max(40),
  recipientName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(8).max(24),
  province: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(4).max(10),
  line1: z.string().trim().min(1).max(300),
  isDefault: z.boolean(),
});
const saved = fields.extend({ id: z.uuid() });
type Row = { id: string; label: string; recipient_name: string; phone: string; province: string; city: string; district: string; postal_code: string; line1: string; is_default: boolean };
const columns = "id, label, recipient_name, phone, province, city, district, postal_code, line1, is_default";
const map = (row: Row) => ({ id: row.id, label: row.label, recipientName: row.recipient_name, phone: row.phone, province: row.province, city: row.city, district: row.district, postalCode: row.postal_code, line1: row.line1, isDefault: row.is_default });

async function userId() { return (await auth.getSession()).data?.user?.id; }

export async function GET() {
  const id = await userId();
  if (!id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await getDb().query<Row>(`SELECT ${columns} FROM account_saved_addresses WHERE user_id=$1 ORDER BY is_default DESC, created_at DESC`, [id]);
  return Response.json({ addresses: rows.map(map) });
}

export async function POST(request: Request) {
  const id = await userId();
  if (!id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = fields.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Alamat tidak lengkap" }, { status: 400 });
  const a = parsed.data;
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const count = await client.query<{ count: string }>("SELECT count(*)::text AS count FROM account_saved_addresses WHERE user_id=$1", [id]);
    const makeDefault = a.isDefault || Number(count.rows[0]?.count ?? 0) === 0;
    if (makeDefault) await client.query("UPDATE account_saved_addresses SET is_default=false WHERE user_id=$1", [id]);
    const { rows } = await client.query<Row>(
      `INSERT INTO account_saved_addresses (user_id,label,recipient_name,phone,province,city,district,postal_code,line1,is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING ${columns}`,
      [id, a.label, a.recipientName, a.phone, a.province, a.city, a.district, a.postalCode, a.line1, makeDefault],
    );
    await client.query("COMMIT");
    return Response.json({ address: map(rows[0]!) });
  } catch { await client.query("ROLLBACK"); return Response.json({ error: "Alamat gagal disimpan" }, { status: 500 }); }
  finally { client.release(); }
}

export async function PUT(request: Request) {
  const user = await userId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = saved.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Alamat tidak lengkap" }, { status: 400 });
  const a = parsed.data;
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ is_default: boolean }>("SELECT is_default FROM account_saved_addresses WHERE id=$1 AND user_id=$2 FOR UPDATE", [a.id, user]);
    if (!current.rows.length) { await client.query("ROLLBACK"); return Response.json({ error: "Alamat tidak ditemukan" }, { status: 404 }); }
    const makeDefault = a.isDefault || current.rows[0]!.is_default;
    if (makeDefault) await client.query("UPDATE account_saved_addresses SET is_default=false WHERE user_id=$1", [user]);
    const { rows } = await client.query<Row>(
      `UPDATE account_saved_addresses SET label=$3,recipient_name=$4,phone=$5,province=$6,city=$7,district=$8,postal_code=$9,line1=$10,is_default=$11,updated_at=now()
       WHERE id=$1 AND user_id=$2 RETURNING ${columns}`,
      [a.id, user, a.label, a.recipientName, a.phone, a.province, a.city, a.district, a.postalCode, a.line1, makeDefault],
    );
    await client.query("COMMIT");
    return Response.json({ address: map(rows[0]!) });
  } catch { await client.query("ROLLBACK"); return Response.json({ error: "Alamat gagal disimpan" }, { status: 500 }); }
  finally { client.release(); }
}

export async function DELETE(request: Request) {
  const user = await userId();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.uuid().safeParse(id).success) return Response.json({ error: "Alamat tidak valid" }, { status: 400 });
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ is_default: boolean }>("DELETE FROM account_saved_addresses WHERE id=$1 AND user_id=$2 RETURNING is_default", [id, user]);
    if (rows[0]?.is_default) await client.query("UPDATE account_saved_addresses SET is_default=true WHERE id=(SELECT id FROM account_saved_addresses WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1)", [user]);
    await client.query("COMMIT");
    return Response.json({ deleted: Boolean(rows.length) });
  } catch { await client.query("ROLLBACK"); return Response.json({ error: "Alamat gagal dihapus" }, { status: 500 }); }
  finally { client.release(); }
}
