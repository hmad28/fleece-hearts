import type { CreatePaymentInput, ID, Payment, PaymentMethod, PaymentProvider } from "@fh/types";
import { mockPaymentMethods } from "@/mocks/data/commerce";
import { delay, mockId } from "./delay";

/** Batas waktu bayar simulasi. */
const EXPIRY_MINUTES = 15;
const STORAGE_KEY = "fh-demo-payments-v1";

/**
 * Simulasi payment gateway.
 * - Pembeli menekan tombol simulasi untuk mengubah PENDING → PAID.
 * - Pembayaran melewati batas waktu menjadi EXPIRED.
 * Nanti diganti MidtransPaymentProvider / XenditPaymentProvider DI BACKEND.
 */
export class MockPaymentProvider implements PaymentProvider {
  private read(paymentId: ID): Payment | undefined {
    if (typeof window === "undefined") return undefined;
    try {
      const values = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<ID, Payment>;
      return values[paymentId];
    } catch {
      return undefined;
    }
  }

  private save(payment: Payment) {
    if (typeof window === "undefined") return;
    let values: Record<ID, Payment> = {};
    try { values = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { /* storage lama rusak */ }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...values, [payment.id]: payment }));
  }

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
          : method.type === "BANK_TRANSFER"
            ? { bankName: "BCA", accountNumber: "000 000 0000 (DUMMY)", accountName: "Fleece Hearts (contoh)" }
            : method.type === "QRIS"
              ? { qrString: `MOCK-QRIS|FLEECEHEARTS|${input.orderNumber}|${input.amount}` }
              : method.type === "COD"
                ? { cod: true }
                : { deeplinkUrl: `#mock-${method.code}` },
      // COD tidak punya batas bayar online; dibayar saat paket sampai.
      expiresAt: new Date(now.getTime() + (method.type === "COD" ? 7 * 24 * 60 : EXPIRY_MINUTES) * 60_000).toISOString(),
      createdAt: now.toISOString(),
    };
    this.save(payment);
    return payment;
  }

  async getPaymentStatus(paymentId: ID): Promise<Payment> {
    await delay(200);
    const payment = this.read(paymentId);
    if (!payment) throw new Error(`Payment tidak ditemukan: ${paymentId}`);
    if (payment.status !== "PENDING") return payment;
    const next: Payment = Date.now() >= new Date(payment.expiresAt).getTime()
      ? { ...payment, status: "EXPIRED" }
      : payment;
    this.save(next);
    return next;
  }

  /** COD: tandai lunas saat paket diterima. */
  async settleCod(paymentId: ID, at: string): Promise<Payment | undefined> {
    const payment = this.read(paymentId);
    if (!payment || payment.status === "PAID") return payment;
    const next: Payment = { ...payment, status: "PAID", paidAt: at };
    this.save(next);
    return next;
  }

  async simulatePayment(paymentId: ID): Promise<Payment> {
    const payment = await this.getPaymentStatus(paymentId);
    if (payment.status !== "PENDING") throw new Error("Pembayaran sudah selesai atau kedaluwarsa");
    const next: Payment = { ...payment, status: "PAID", paidAt: new Date().toISOString() };
    this.save(next);
    return next;
  }
}
