import type { ID, ISODateString, Rupiah } from "./common";
import type { Address, CustomerContact } from "./customer";
import type { PaymentStatus } from "./payment";
import type { ShipmentStatus } from "./shipping";

/** Order, payment, dan shipment status SENGAJA dipisah (blueprint §7). */
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED";

export interface OrderItem {
  id: ID;
  productId: ID;
  variantId: ID;
  /** Snapshot saat order dibuat — tidak ikut berubah kalau produk diedit. */
  productName: string;
  sku: string;
  size: string;
  color: string;
  imageUrl: string | null;
  unitPrice: Rupiah;
  quantity: number;
  lineTotal: Rupiah;
}

export interface OrderEvent {
  at: ISODateString;
  type: "ORDER" | "PAYMENT" | "SHIPMENT";
  status: string;
  note?: string;
}

export interface Order {
  id: ID;
  /** Mis. FH-202610-0001 (format final menunggu konfirmasi). */
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  customer: CustomerContact;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: Rupiah;
  shippingFee: Rupiah;
  paymentFee: Rupiah;
  discount: Rupiah;
  total: Rupiah;
  paymentId?: ID;
  paymentMethodCode: string;
  courierCode: string;
  courierService: string;
  trackingNumber?: string;
  /** Jarak jalan toko → tujuan saat checkout (km). */
  distanceKm?: number;
  /** Label estimasi layanan kirim yang dipilih. */
  etaLabel?: string;
  createdAt: ISODateString;
  timeline: OrderEvent[];
}

export interface CreateOrderInput {
  customer: CustomerContact;
  shippingAddress: Address;
  items: { variantId: ID; quantity: number }[];
  courierCode: string;
  courierService: string;
  paymentMethodCode: string;
  voucherCode?: string;
  distanceKm?: number;
}

export interface OrderLookupInput {
  orderNumber: string;
  /** Email atau nomor WA yang dipakai saat checkout. */
  contact: string;
}
