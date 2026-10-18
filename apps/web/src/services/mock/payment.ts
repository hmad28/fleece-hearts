import type { CreatePaymentInput, ID, Payment, PaymentMethod, PaymentProvider } from "@fh/types";
import { mockPaymentMethods } from "@/mocks/data/commerce";
import { delay, mockId } from "./delay";

/** Batas waktu bayar simulasi. */
const EXPIRY_MINUTES = 15;

/**
 * Simulasi payment gateway.
 * - Pembayaran otomatis jadi PAID setelah `autoPayAfterMs` (demo alur sukses).
 * - Nominal berakhiran 13 rupiah → FAILED (untuk uji alur gagal).
 * - Lewat batas waktu → EXPIRED.
 * Nanti diganti MidtransPaymentProvider / XenditPaymentProvider DI BACKEND.
 */
export class MockPaymentProvider implements PaymentProvider {
  private readonly payments = new Map<ID, Payment>();

  constructor(private readonly autoPayAfterMs = 8000) {}

  async listMethods(): Promise<PaymentMethod[]> {
    await delay(150);
    return mockPaymentMethods;
  }

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    await delay(400);
    const method = mockPaymentMethods.find((m) => m.code === input.methodCode);
    if (!method) throw new Error(`Metode pembayaran tidak dikenal: ${input.methodCode}`);

    const now = new Date();
    const payment: Payment = {
      id: mockId("pay"),
      orderId: input.orderId,
      amount: input.amount,
      methodCode: method.code,
      status: "PENDING",
      instructions:
        method.type === "VIRTUAL_ACCOUNT"
          ? { bankName: method.name.replace(" Virtual Account", ""), vaNumber: `8808${Date.now().toString().slice(-10)}` }
          : method.type === "QRIS"
            ? { qrString: `MOCK-QRIS-${input.orderNumber}` }
            : { deeplinkUrl: `#mock-${method.code}` },
      expiresAt: new Date(now.getTime() + EXPIRY_MINUTES * 60_000).toISOString(),
      createdAt: now.toISOString(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async getPaymentStatus(paymentId: ID): Promise<Payment> {
    await delay(200);
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error(`Payment tidak ditemukan: ${paymentId}`);
    if (payment.status !== "PENDING") return payment;

    const now = Date.now();
    const age = now - new Date(payment.createdAt).getTime();
    let next: Payment = payment;

    if (now >= new Date(payment.expiresAt).getTime()) {
      next = { ...payment, status: "EXPIRED" };
    } else if (payment.amount % 100 === 13) {
      next = { ...payment, status: "FAILED" };
    } else if (age >= this.autoPayAfterMs) {
      next = { ...payment, status: "PAID", paidAt: new Date(now).toISOString() };
    }

    this.payments.set(paymentId, next);
    return next;
  }
}
