import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const addressSchema = z.object({
  recipientName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(8).max(24),
  province: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(4).max(10),
  line1: z.string().trim().min(1).max(300),
});

async function currentUser() {
  const { data } = await auth.getSession();
  return data?.user;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const [saved, legacy, profile] = await Promise.all([
    getDb().query("SELECT recipient_name, phone, province, city, district, postal_code, line1 FROM account_saved_addresses WHERE user_id=$1 AND is_default=true LIMIT 1", [user.id]),
    getDb().query("SELECT recipient_name, phone, province, city, district, postal_code, line1 FROM account_addresses WHERE user_id=$1", [user.id]),
    getDb().query<{ first_name: string; last_name: string; phone: string }>("SELECT first_name,last_name,phone FROM account_profiles WHERE user_id=$1", [user.id]),
  ]);
  const row = saved.rows[0] ?? legacy.rows[0];
  const profileName = [profile.rows[0]?.first_name, profile.rows[0]?.last_name].filter(Boolean).join(" ");
  return Response.json({ customer: { name: profileName || user.name, email: user.email, phone: profile.rows[0]?.phone ?? "" }, address: row ? {
    recipientName: row.recipient_name, phone: row.phone, province: row.province,
    city: row.city, district: row.district, postalCode: row.postal_code, line1: row.line1,
  } : null });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Alamat tidak lengkap" }, { status: 400 });
  const a = parsed.data;
  const values = [user.id, a.recipientName, a.phone, a.province, a.city, a.district, a.postalCode, a.line1];
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO account_addresses (user_id, recipient_name, phone, province, city, district, postal_code, line1)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id) DO UPDATE SET
         recipient_name=EXCLUDED.recipient_name, phone=EXCLUDED.phone,
         province=EXCLUDED.province, city=EXCLUDED.city, district=EXCLUDED.district,
         postal_code=EXCLUDED.postal_code, line1=EXCLUDED.line1, updated_at=now()`, values,
    );
    const updated = await client.query(
      `UPDATE account_saved_addresses SET recipient_name=$2,phone=$3,province=$4,city=$5,district=$6,postal_code=$7,line1=$8,updated_at=now()
       WHERE user_id=$1 AND is_default=true`, values,
    );
    if (!updated.rowCount) await client.query(
      `INSERT INTO account_saved_addresses (user_id,label,recipient_name,phone,province,city,district,postal_code,line1,is_default)
       VALUES ($1,'Utama',$2,$3,$4,$5,$6,$7,$8,true)`, values,
    );
    await client.query("COMMIT");
  } catch {
    await client.query("ROLLBACK");
    return Response.json({ error: "Alamat gagal disimpan" }, { status: 500 });
  } finally { client.release(); }
  return Response.json({ address: a });
}
