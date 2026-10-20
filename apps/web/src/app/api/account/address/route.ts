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
  const { rows } = await getDb().query(
    "SELECT recipient_name, phone, province, city, district, postal_code, line1 FROM account_addresses WHERE user_id = $1",
    [user.id],
  );
  const row = rows[0];
  return Response.json({ customer: { name: user.name, email: user.email }, address: row ? {
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
  await getDb().query(
    `INSERT INTO account_addresses (user_id, recipient_name, phone, province, city, district, postal_code, line1)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (user_id) DO UPDATE SET
       recipient_name=EXCLUDED.recipient_name, phone=EXCLUDED.phone,
       province=EXCLUDED.province, city=EXCLUDED.city, district=EXCLUDED.district,
       postal_code=EXCLUDED.postal_code, line1=EXCLUDED.line1, updated_at=now()`,
    [user.id, a.recipientName, a.phone, a.province, a.city, a.district, a.postalCode, a.line1],
  );
  return Response.json({ address: a });
}
