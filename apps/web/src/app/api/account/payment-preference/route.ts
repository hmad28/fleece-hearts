import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { mockPaymentMethods } from "@/mocks/data/commerce";

export async function GET() {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await getDb().query<{ method_code: string }>("SELECT method_code FROM account_payment_preferences WHERE user_id=$1", [data.user.id]);
  return Response.json({ methodCode: rows[0]?.method_code ?? null });
}

export async function PUT(request: Request) {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ methodCode: z.string() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || !mockPaymentMethods.some((method) => method.code === parsed.data.methodCode)) return Response.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
  await getDb().query(
    `INSERT INTO account_payment_preferences (user_id, method_code) VALUES ($1,$2)
     ON CONFLICT (user_id) DO UPDATE SET method_code=EXCLUDED.method_code,updated_at=now()`,
    [data.user.id, parsed.data.methodCode],
  );
  return Response.json({ methodCode: parsed.data.methodCode });
}

export async function DELETE() {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await getDb().query("DELETE FROM account_payment_preferences WHERE user_id=$1", [data.user.id]);
  return Response.json({ methodCode: null });
}
