import type { Metadata } from "next";
import { OrderLookup } from "@/components/order/order-lookup";

export const metadata: Metadata = { title: "Cek order" };

export default function OrdersPage() {
  return <OrderLookup />;
}
