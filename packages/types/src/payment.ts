import type { ID, ISODateString, Rupiah } from "./common";
import type { CustomerContact } from "./customer";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethodType = "VIRTUAL_ACCOUNT" | "BANK_TRANSFER" | "QRIS" | "EWALLET" | "COD";

export interface PaymentMethod {
  code: string;
  name: string;
  type: PaymentMethodType;
  /** Biaya admin flat (kalau dibebankan ke pembeli). */
  fee: Rupiah;
}

export interface CreatePaymentInput {
  orderId: ID;
  orderNumber: string;
  amount: Rupiah;
  methodCode: string;
  customer: CustomerContact;
}

export interface PaymentInstructions {
  vaNumber?: string;
  bankName?: string;
  qrString?: string;
  deeplinkUrl?: string;
  accountNumber?: string;
  accountName?: string;
  /** Bayar di tempat: pembayaran dikonfirmasi saat paket sampai. */
  cod?: boolean;
}

export interface Payment {
  id: ID;
  orderId: ID;
  amount: Rupiah;
  methodCode: string;
  status: PaymentStatus;
  instructions: PaymentInstructions;
  expiresAt: ISODateString;
  paidAt?: ISODateString;
  createdAt: ISODateString;
}

/**
 * Kontrak provider pembayaran (blueprint §27).
 * Sekarang: MockPaymentProvider. Nanti: Midtrans / Xendit — di BACKEND, bukan di browser.
 */
export interface PaymentProvider {
  listMethods(): Promise<PaymentMethod[]>;
  createPayment(input: CreatePaymentInput): Promise<Payment>;
  getPaymentStatus(paymentId: ID): Promise<Payment>;
  /** Hanya tersedia di mode demo; provider asli tidak memerlukan aksi ini. */
  simulatePayment?(paymentId: ID): Promise<Payment>;
}
