export interface CustomerContact {
  name: string;
  email: string;
  /** Format 08xx / 628xx. */
  phone: string;
}

export interface Address {
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  /** Kelurahan/desa (opsional, dari data wilayah). */
  village?: string;
  line1: string;
  notes?: string;
  /** Koordinat tujuan untuk hitung jarak & peta (opsional). */
  latitude?: number;
  longitude?: number;
}
