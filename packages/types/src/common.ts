/**
 * Nominal rupiah, selalu integer (tanpa desimal).
 * Jangan pernah pakai float untuk uang.
 */
export type Rupiah = number;

/** ISO 8601 string, selalu dari server (UTC). */
export type ISODateString = string;

export type ID = string;

export interface MediaAsset {
  id: ID;
  /** null = belum ada foto asli, UI tampilkan placeholder. */
  url: string | null;
  alt: string;
  width?: number;
  height?: number;
}

/**
 * Penanda data dummy. Semua mock data yang bukan dari klien
 * WAJIB `isDummy: true` supaya gampang dicari & diganti.
 */
export interface DummyFlag {
  isDummy?: boolean;
}
