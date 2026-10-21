"use client";

import type { Product } from "@fh/types";
import { getProductStockStatus, getVariantStockStatus } from "@fh/shared";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

/** Stok sudah dari katalog (DB/mock); fungsi ini titik sambung kalau nanti stok live. */
export function useLiveProduct(product: Product): Product {
  return product;
}

export function LiveStockTag({ product, upcomingDropCode }: { product: Product; upcomingDropCode?: string }) {
  const live = useLiveProduct(product);
  const stock = getProductStockStatus(live);
  const tag = upcomingDropCode
    ? `Rilis ${upcomingDropCode}`
    : stock === "OUT_OF_STOCK"
      ? "Habis"
      : stock === "LOW_STOCK"
        ? "Sisa sedikit"
        : null;
  if (!tag) return null;
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs leading-none", upcomingDropCode ? "bg-brand text-ink" : "bg-paper text-ink")}>
      {tag}
    </span>
  );
}

/** Tambah cepat ukuran langsung dari kartu (desktop: muncul saat hover; mobile: tombol +). */
export function QuickAdd({ product }: { product: Product }) {
  const live = useLiveProduct(product);
  const add = useCartStore((s) => s.add);
  const [added, setAdded] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const variants = live.variants.filter((v) => v.status === "ACTIVE");
  if (variants.every((v) => v.available <= 0)) return null;

  const addVariant = (variantId: string) => {
    add({ productId: product.id, variantId, quantity: 1 });
    setAdded(variantId);
    setTimeout(() => setAdded(null), 1400);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (variants.length === 1 ? addVariant(variants[0]!.id) : setOpen((v) => !v))}
        className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-paper shadow-sm md:hidden"
        aria-label={`Tambah cepat ${product.name}`}
        aria-expanded={open}
      >
        {added ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      </button>
      <div
        className={cn(
          "absolute inset-x-2 bottom-2 rounded-xl bg-paper/95 p-2 backdrop-blur transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
          "md:pointer-events-auto md:translate-y-3 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100",
        )}
      >
        <p className="px-1 pb-1.5 text-xs text-stone">{added ? "Masuk keranjang" : "Tambah cepat"}</p>
        <div className="flex flex-wrap gap-1">
          {variants.map((v) => {
            const out = getVariantStockStatus(v) === "OUT_OF_STOCK";
            return (
              <button
                key={v.id}
                type="button"
                disabled={out}
                onClick={() => addVariant(v.id)}
                className={cn(
                  "h-8 min-w-10 flex-1 rounded-full border px-2 text-xs transition-colors",
                  added === v.id ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
                  out && "cursor-not-allowed text-stone line-through",
                )}
                aria-label={`Tambah ${product.name} ukuran ${v.size}${out ? " (habis)" : ""}`}
              >
                {v.size}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
