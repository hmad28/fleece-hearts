import type { DummyFlag, ID, MediaAsset, Rupiah } from "./common";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type VariantStatus = "ACTIVE" | "INACTIVE";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Category extends DummyFlag {
  id: ID;
  name: string;
  slug: string;
}

export interface Collection extends DummyFlag {
  id: ID;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductImage extends MediaAsset {
  position: number;
}

export interface ProductVariant {
  id: ID;
  productId: ID;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  /** Override harga per varian (jarang dipakai). */
  price?: Rupiah;
  /**
   * Stok tersedia (sudah dikurangi reservasi).
   * Sumber kebenaran ada di inventory ledger backend.
   */
  available: number;
  weightGram?: number;
  status: VariantStatus;
}

export interface SizeGuide extends DummyFlag {
  id: ID;
  name: string;
  unit: "cm";
  columns: string[];
  rows: { size: string; values: (number | string)[] }[];
  note?: string;
}

export interface SeoMeta {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface Product extends DummyFlag {
  id: ID;
  slug: string;
  name: string;
  /** Nama warna utama untuk format "Produk – Warna". */
  colorway?: string;
  description: string;
  material?: string;
  careInstructions: string[];
  price: Rupiah;
  compareAtPrice?: Rupiah;
  categoryId: ID;
  collectionIds: ID[];
  dropId?: ID;
  images: ProductImage[];
  variants: ProductVariant[];
  weightGram: number;
  status: ProductStatus;
  isFeatured: boolean;
  sizeGuideId?: ID;
  seo?: SeoMeta;
  createdAt: string;
}

export interface ProductListQuery {
  categorySlug?: string;
  collectionSlug?: string;
  dropSlug?: string;
  size?: string;
  availableOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  perPage?: number;
}
