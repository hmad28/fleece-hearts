import type { DummyFlag, ID, ISODateString, MediaAsset } from "./common";

/**
 * Status drop SELALU diturunkan dari waktu server + stok,
 * bukan disimpan manual. Lihat `getDropStatus` di @fh/shared.
 */
export type DropStatus = "UPCOMING" | "LIVE" | "SOLD_OUT" | "ENDED";

export interface Drop extends DummyFlag {
  id: ID;
  slug: string;
  /** Kode rilis, mis. "CH01". */
  code: string;
  name: string;
  tagline?: string;
  description?: string;
  banner: MediaAsset;
  releaseAt: ISODateString;
  endAt?: ISODateString;
  productIds: ID[];
}

export interface DropWithStatus extends Drop {
  status: DropStatus;
}
