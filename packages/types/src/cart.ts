import type { ID, Rupiah } from "./common";

/** Yang disimpan di client: cukup referensi + qty. Harga selalu dihitung ulang server. */
export interface CartItem {
  productId: ID;
  variantId: ID;
  quantity: number;
}

export interface CartLine extends CartItem {
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  imageUrl: string | null;
  unitPrice: Rupiah;
  lineTotal: Rupiah;
  available: number;
}

export interface CartSummary {
  lines: CartLine[];
  itemCount: number;
  subtotal: Rupiah;
  totalWeightGram: number;
}
