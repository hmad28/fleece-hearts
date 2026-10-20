import type { Metadata } from "next";
import { DemoPayment } from "@/components/order/demo-payment";

export const metadata: Metadata = { title: "Pembayaran" };

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DemoPayment id={id} />;
}
