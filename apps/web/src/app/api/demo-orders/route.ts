import type { Order } from "@fh/types";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

const orderSchema = z.object({
  id: z.string().min(1).max(100),
  orderNumber: z.string().min(1).max(100),
  status: z.string(), paymentStatus: z.string(), shipmentStatus: z.string(),
  customer: z.object({ email: z.email(), name: z.string(), phone: z.string() }),
  items: z.array(z.object({ productName: z.string(), quantity: z.number().int().positive(), lineTotal: z.number().int().min(0) })).min(1),
  total: z.number().int().min(0),
  createdAt: z.iso.datetime({ offset: true }),
}).passthrough();

export async function GET() {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE customer_user_id=$1 ORDER BY created_at DESC LIMIT 100", [data.user.id]);
  return Response.json(rows.map((row) => row.data));
}

export async function POST(request: Request) {
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Order demo tidak valid" }, { status: 400 });
  const order = parsed.data;
  if (order.customer.email.toLowerCase() !== data.user.email.toLowerCase()) return Response.json({ error: "Email order harus sama dengan akun" }, { status: 400 });
  await getDb().query(
    `INSERT INTO demo_orders (id,order_number,customer_user_id,customer_email,data,created_at)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6)
     ON CONFLICT (id) DO UPDATE SET
       data=CASE WHEN demo_orders.admin_override THEN demo_orders.data ELSE EXCLUDED.data END,
       updated_at=now()
     WHERE demo_orders.customer_user_id=EXCLUDED.customer_user_id`,
    [order.id, order.orderNumber, data.user.id, order.customer.email, JSON.stringify(order), order.createdAt],
  );
  return Response.json({ ok: true });
}
