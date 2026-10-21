import type { Metadata } from "next";
import { OrderDetail } from "@/components/order/order-detail";

export const metadata: Metadata = { title: "Detail pesanan" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ baru?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <OrderDetail id={id} fresh={sp.baru === "1"} />;
}
