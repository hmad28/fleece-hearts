"use client";

import type { Product, SizeGuide } from "@fh/types";
import { getVariantStockStatus, LOW_STOCK_THRESHOLD } from "@fh/shared";
import { MessageCircle, Minus, Plus, Ruler } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useLiveProduct } from "./product-card-live";

interface ProductPurchaseProps {
  product: Product;
  sizeGuide?: SizeGuide | null;
  /** Teks pengganti tombol saat produk dikunci drop. */
  lockedLabel?: string;
}

export function ProductPurchase({ product: staticProduct, sizeGuide, lockedLabel }: ProductPurchaseProps) {
  const product = useLiveProduct(staticProduct);
  const variants = product.variants.filter((v) => v.status === "ACTIVE");
  const single = variants.length === 1 ? variants[0] : undefined;
  const [variantId, setVariantId] = useState<string | undefined>(single?.id);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const add = useCartStore((s) => s.add);
  const close = useCartStore((s) => s.close);
  const router = useRouter();

  const selected = variants.find((v) => v.id === variantId);
  const totalStock = variants.reduce((n, v) => n + Math.max(0, v.available), 0);
  const maxQty = Math.max(1, Math.min(10, selected?.available ?? 1));
  const allSoldOut = totalStock <= 0;

  useEffect(() => {
    if (qty > maxQty) setQty(maxQty);
  }, [maxQty, qty]);

  function addToCart(): boolean {
    if (!selected) {
      setError("Pilih ukuran dulu.");
      return false;
    }
    if (selected.available <= 0) {
      setError("Ukuran ini sudah habis.");
      return false;
    }
    add({ productId: product.id, variantId: selected.id, quantity: qty });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    return true;
  }

  const availability = selected
    ? selected.available <= 0
      ? { text: `Ukuran ${selected.size} habis`, tone: "text-danger" }
      : selected.available <= LOW_STOCK_THRESHOLD
        ? { text: `Sisa ${selected.available} untuk ukuran ${selected.size}`, tone: "text-[#9a5b00]" }
        : { text: `Tersedia · ${selected.available} pcs ukuran ${selected.size}`, tone: "text-[#1f7a3f]" }
    : allSoldOut
      ? { text: "Semua ukuran habis", tone: "text-danger" }
      : { text: `Tersedia · ${totalStock} pcs di semua ukuran`, tone: "text-[#1f7a3f]" };

  return (
    <div>
      {!single && (
        <fieldset>
          <div className="flex items-center justify-between">
            <legend className="text-sm">
              Ukuran{selected && <span className="text-stone">: {selected.size}</span>}
            </legend>
            {sizeGuide && <SizeGuideButton guide={sizeGuide} />}
          </div>
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
                    "relative flex h-14 flex-col items-center justify-center rounded-xl border text-sm transition-colors",
                    active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
                    out && "cursor-not-allowed bg-mist text-stone line-through decoration-1 hover:border-line",
                  )}
                >
                  <span className="font-medium">{v.size}</span>
                  {!out && status === "LOW_STOCK" && (
                    <span className={cn("text-[11px] leading-none", active ? "text-paper/70" : "text-[#9a5b00]")}>sisa {v.available}</span>
                  )}
                  <span className="sr-only">{out ? " (habis)" : ""}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className={cn("mt-4 flex items-center gap-2 text-sm", availability.tone)} aria-live="polite">
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {availability.text}
      </p>

      <div className="mt-4 flex gap-3">
        <div className="flex h-14 shrink-0 items-center rounded-full border border-line" role="group" aria-label="Jumlah">
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
            disabled={qty >= maxQty || !selected}
            aria-label="Tambah jumlah"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        {lockedLabel || allSoldOut ? (
          <Button size="lg" block disabled className="min-w-0 flex-1 whitespace-normal text-center leading-tight">
            {lockedLabel ?? "Habis"}
          </Button>
        ) : (
          <Button size="lg" variant="ink" block className="min-w-0 flex-1" onClick={addToCart}>
            {justAdded ? "Masuk keranjang ✓" : "Tambah ke keranjang"}
          </Button>
        )}
      </div>

      {!lockedLabel && !allSoldOut && (
        <Button
          size="lg"
          variant="brand"
          block
          className="mt-3"
          onClick={() => {
            if (addToCart()) {
              close();
              router.push("/checkout");
            }
          }}
        >
          Beli sekarang
        </Button>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      <Link
        href={`/account/chat?produk=${encodeURIComponent(product.slug)}`}
        className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4"
      >
        <MessageCircle className="size-4" aria-hidden />
        Tanya admin soal produk ini
      </Link>
    </div>
  );
}

function SizeGuideButton({ guide }: { guide: SizeGuide }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4">
        <Ruler className="size-4" aria-hidden />
        Panduan ukuran
      </button>
      <dialog
        ref={ref}
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
        aria-labelledby="size-guide-title"
        className="m-auto w-[min(92vw,34rem)] rounded-2xl bg-paper p-0 text-ink backdrop:bg-ink/40"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="size-guide-title" className="font-display text-3xl">
              Panduan ukuran
            </h2>
            <button type="button" onClick={() => ref.current?.close()} className="text-sm underline underline-offset-4">
              Tutup
            </button>
          </div>
          <p className="mt-1 text-sm text-stone">{guide.name} · dalam {guide.unit}</p>
          <div className="mt-5 overflow-x-auto">
            <table className="tabular w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink">
                  <th className="py-2 pr-4 font-medium">Ukuran</th>
                  {guide.columns.map((c) => (
                    <th key={c} className="py-2 pr-4 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((r) => (
                  <tr key={r.size} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{r.size}</td>
                    {r.values.map((v, i) => (
                      <td key={i} className="py-2.5 pr-4">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {guide.note && <p className="mt-4 text-sm">{guide.note}</p>}
        </div>
      </dialog>
    </>
  );
}
