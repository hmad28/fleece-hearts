/**
 * ⚠️ DATA SIMULASI — tarif & metode bayar contoh, bukan dari provider asli.
 */
import type { PaymentMethod } from "@fh/types";

export const mockPaymentMethods: PaymentMethod[] = [
  { code: "va_bca", name: "BCA Virtual Account", type: "VIRTUAL_ACCOUNT", fee: 0 },
  { code: "va_mandiri", name: "Mandiri Virtual Account", type: "VIRTUAL_ACCOUNT", fee: 0 },
  { code: "va_bni", name: "BNI Virtual Account", type: "VIRTUAL_ACCOUNT", fee: 0 },
  { code: "va_bri", name: "BRI Virtual Account", type: "VIRTUAL_ACCOUNT", fee: 0 },
  { code: "transfer_bca", name: "Transfer Bank BCA (manual)", type: "BANK_TRANSFER", fee: 0 },
  { code: "qris", name: "QRIS", type: "QRIS", fee: 0 },
  { code: "gopay", name: "GoPay", type: "EWALLET", fee: 0 },
  { code: "ovo", name: "OVO", type: "EWALLET", fee: 0 },
  { code: "dana", name: "DANA", type: "EWALLET", fee: 0 },
  { code: "shopeepay", name: "ShopeePay", type: "EWALLET", fee: 0 },
  { code: "cod", name: "Bayar di tempat (COD)", type: "COD", fee: 3000 },
];

/** COD hanya untuk tujuan dalam radius ini dari toko (simulasi). */
export const COD_MAX_KM = 60;

/** Tarif per kg (dibulatkan ke atas), simulasi. */
export const mockCourierServices = [
  { courierCode: "jne", courierName: "JNE", service: "REG", serviceName: "Reguler", perKg: 11000, etd: { min: 2, max: 3 } },
  { courierCode: "jne", courierName: "JNE", service: "YES", serviceName: "Yakin Esok Sampai", perKg: 22000, etd: { min: 1, max: 1 } },
  { courierCode: "jnt", courierName: "J&T Express", service: "EZ", serviceName: "Reguler", perKg: 10000, etd: { min: 2, max: 4 } },
  { courierCode: "sicepat", courierName: "SiCepat", service: "REG", serviceName: "Reguler", perKg: 10500, etd: { min: 2, max: 3 } },
  { courierCode: "anteraja", courierName: "AnterAja", service: "REG", serviceName: "Reguler", perKg: 10000, etd: { min: 2, max: 4 } },
] as const;
