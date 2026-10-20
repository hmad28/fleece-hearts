import type { Order, OrderStatus, ShipmentStatus } from "@fh/types";
import { z } from "zod";
import { adminGuard } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED"]),
  shipmentStatus: z.enum(["PENDING", "READY", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "RETURNED", "FAILED"]),
  trackingNumber: z.string().trim().max(100),
  note: z.string().trim().max(300),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard(); if (denied) return denied;
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Status tidak valid" }, { status: 400 });
  const { rows } = await getDb().query<{ data: Order }>("SELECT data FROM demo_orders WHERE id=$1", [id]);
  const current = rows[0]?.data;
  if (!current) return Response.json({ error: "Order tidak ditemukan" }, { status: 404 });
  const input = parsed.data;
  const next: Order = {
    ...current, status: input.status as OrderStatus, shipmentStatus: input.shipmentStatus as ShipmentStatus,
    trackingNumber: input.trackingNumber || undefined,
    timeline: [...current.timeline, { at: new Date().toISOString(), type: "ORDER", status: input.status, note: input.note || "Diperbarui admin" }],
  };
  await getDb().query("UPDATE demo_orders SET data=$2::jsonb,admin_override=true,updated_at=now() WHERE id=$1", [id, JSON.stringify(next)]);
  return Response.json(next);
}
