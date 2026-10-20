import type { Metadata } from "next";
import { OrderDetail } from "@/components/order/order-detail";

export const metadata: Metadata = { title: "Detail pesanan" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
