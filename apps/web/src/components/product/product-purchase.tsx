"use client";

import type { Product } from "@fh/types";
import { getVariantStockStatus, LOW_STOCK_THRESHOLD } from "@fh/shared";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

interface ProductPurchaseProps {
  product: Product;
  /** Teks pengganti tombol saat produk dikunci drop, mis. "Rilis Rabu, 21 Oktober, 19.00 WIB". */
  lockedLabel?: string;
}

export function ProductPurchase({ product, lockedLabel }: ProductPurchaseProps) {
  const variants = product.variants.filter((v) => v.status === "ACTIVE");
  const single = variants.length === 1 ? variants[0] : undefined;
  const [variantId, setVariantId] = useState<string | undefined>(single?.id);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const add = useCartStore((s) => s.add);

  const selected = variants.find((v) => v.id === variantId);
  const maxQty = Math.min(10, selected?.available ?? 1);
  const allSoldOut = variants.every((v) => v.available <= 0);

  function handleAdd() {
    if (!selected) {
      setError("Pilih ukuran dulu.");
      return;
    }
    add({ productId: product.id, variantId: selected.id, quantity: qty });
    setQty(1);
  }

  return (
    <div>
      {!single && (
        <fieldset>
          <legend className="text-sm">
            Ukuran
            {selected && <span className="text-stone">: {selected.size}</span>}
          </legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {variants.map((v) => {
              const status = getVariantStockStatus(v);
              const out = status === "OUT_OF_STOCK";
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  aria-pressed={active}
                  onClick={() => {
                    setVariantId(v.id);
                    setQty(1);
                    setError(null);
                  }}
                  className={cn(
                    "relative h-12 rounded-full border text-sm transition-colors",
                    active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                    out && "cursor-not-allowed text-stone line-through decoration-1 hover:border-line",
                  )}
                >
                  {v.size}
                  <span className="sr-only">{out ? " (habis)" : status === "LOW_STOCK" ? " (stok terbatas)" : ""}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 min-h-5 text-sm text-stone" aria-live="polite">
            {selected && selected.available > 0
              ? selected.available <= LOW_STOCK_THRESHOLD ? `Sisa ${selected.available}` : `Tersedia ${selected.available}`
              : ""}
          </p>
        </fieldset>
      )}

      <div className="mt-4 flex gap-3">
        <div className="flex h-14 items-center rounded-full border border-line" role="group" aria-label="Jumlah">
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-full disabled:opacity-30"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Kurangi jumlah"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="tabular w-6 text-center" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-full disabled:opacity-30"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            aria-label="Tambah jumlah"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        {lockedLabel ? (
          <Button size="lg" block disabled className="min-w-0 flex-1 whitespace-normal text-center leading-tight">
            {lockedLabel}
          </Button>
        ) : allSoldOut ? (
          <Button size="lg" block disabled className="min-w-0 flex-1 whitespace-normal text-center leading-tight">
            Habis
          </Button>
        ) : (
          <Button size="lg" variant="brand" block className="min-w-0 flex-1 whitespace-normal text-center leading-tight" onClick={handleAdd}>
            Tambah ke keranjang
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
