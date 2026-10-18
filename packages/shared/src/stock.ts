import type { Product, ProductVariant, StockStatus } from "@fh/types";

/** Ambang "LOW STOCK". Nanti dipindah ke system settings. */
export const LOW_STOCK_THRESHOLD = 3;

export function getVariantStockStatus(variant: Pick<ProductVariant, "available" | "status">): StockStatus {
  if (variant.status !== "ACTIVE" || variant.available <= 0) return "OUT_OF_STOCK";
  if (variant.available <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
  return "IN_STOCK";
}

export function getProductStockStatus(product: Pick<Product, "variants">): StockStatus {
  const active = product.variants.filter((v) => v.status === "ACTIVE");
  const total = active.reduce((sum, v) => sum + Math.max(0, v.available), 0);
  if (total <= 0) return "OUT_OF_STOCK";
  if (active.every((v) => v.available <= LOW_STOCK_THRESHOLD)) return "LOW_STOCK";
  return "IN_STOCK";
}
