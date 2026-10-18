import { z } from "zod";

/**
 * Schema dipakai bersama oleh frontend (form) dan backend (request validation).
 * Backend tetap WAJIB validasi ulang — validasi frontend cuma untuk UX.
 */

/** Nomor HP Indonesia: 08xx / 628xx / +628xx, 10–15 digit. */
export const indonesianPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+62|62|0)8\d{8,12}$/, "Nomor WhatsApp tidak valid"));

export const customerContactSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.email("Email tidak valid"),
  phone: indonesianPhoneSchema,
});

export const addressSchema = z.object({
  recipientName: z.string().trim().min(2, "Nama penerima wajib diisi").max(100),
  phone: indonesianPhoneSchema,
  province: z.string().trim().min(1, "Provinsi wajib diisi"),
  city: z.string().trim().min(1, "Kota/Kabupaten wajib diisi"),
  district: z.string().trim().min(1, "Kecamatan wajib diisi"),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Kode pos 5 digit"),
  line1: z.string().trim().min(5, "Alamat terlalu pendek").max(300),
  notes: z.string().trim().max(200).optional(),
});

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z.object({
  customer: customerContactSchema,
  shippingAddress: addressSchema,
  items: z.array(cartItemSchema).min(1, "Keranjang kosong"),
  courierCode: z.string().min(1, "Pilih kurir"),
  courierService: z.string().min(1, "Pilih layanan kurir"),
  paymentMethodCode: z.string().min(1, "Pilih metode pembayaran"),
  voucherCode: z.string().trim().max(50).optional(),
});

export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(4, "Nomor order tidak valid"),
  contact: z.string().trim().min(5, "Masukkan email atau nomor WhatsApp"),
});

export type CustomerContactForm = z.infer<typeof customerContactSchema>;
export type AddressForm = z.infer<typeof addressSchema>;
export type CheckoutForm = z.infer<typeof checkoutSchema>;
export type OrderLookupForm = z.infer<typeof orderLookupSchema>;
