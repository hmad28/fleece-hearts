"use client";

import type { CartLine, Product } from "@fh/types";
import { formatRupiah } from "@fh/shared";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { services } from "@/services";
import { useCartStore } from "@/stores/cart-store";

/**
 * Harga & stok di keranjang selalu diambil ulang dari katalog — localStorage
 * hanya menyimpan varian + jumlah.
 */
function useCartLines() {
  const items = useCartStore((s) => s.items);
  const productIds = useMemo(() => [...new Set(items.map((i) => i.productId))].sort(), [items]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["cart-products", productIds],
    queryFn: () => services.catalog.getProductsByIds(productIds),
    enabled: productIds.length > 0,
  });

  const lines: CartLine[] = useMemo(() => {
    if (!products) return [];
    const byId = new Map<string, Product>(products.map((p) => [p.id, p]));
    return items.flatMap((item) => {
      const p = byId.get(item.productId);
      const v = p?.variants.find((x) => x.id === item.variantId);
      if (!p || !v) return [];
      const unitPrice = v.price ?? p.price;
      return [
        {
          ...item,
          productName: p.colorway ? `${p.name} – ${p.colorway}` : p.name,
          productSlug: p.slug,
          size: v.size,
          color: v.color,
          imageUrl: p.images[0]?.url ?? null,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
          available: v.available,
        },
      ];
    });
  }, [items, products]);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return { lines, subtotal, isLoading: isLoading && productIds.length > 0, isEmpty: items.length === 0 };
}

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const ref = useRef<HTMLDialogElement>(null);
  const { lines, subtotal, isLoading, isEmpty } = useCartLines();

  // Sinkronkan state store dengan <dialog> native (focus trap + Esc gratis).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const overStock = lines.some((l) => l.quantity > l.available);

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-labelledby="cart-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-paper p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <h2 id="cart-title" className="font-display text-2xl">
          Keranjang
        </h2>
        <button
          type="button"
          onClick={close}
          className="flex size-11 items-center justify-center rounded-full hover:bg-mist"
          aria-label="Tutup keranjang"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {isEmpty ? (
          <div className="py-16">
            <p className="text-lg">Keranjangmu masih kosong.</p>
            <Link href="/shop" onClick={close} className="mt-3 inline-block text-sm underline underline-offset-4">
              Mulai belanja
            </Link>
          </div>
        ) : isLoading ? (
          <p className="py-16 text-stone">Memuat keranjang…</p>
        ) : (
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-4 py-5">
                <Link href={`/products/${l.productSlug}`} onClick={close} className="w-20 shrink-0">
                  <Media asset={{ url: l.imageUrl, alt: l.productName }} placeholderLabel="" sizes="80px" className="aspect-[4/5] w-20" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/products/${l.productSlug}`} onClick={close} className="block text-sm hover:underline">
                        {l.productName}
                      </Link>
                      <p className="mt-0.5 text-sm text-stone">Ukuran {l.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(l.variantId)}
                      className="shrink-0 text-sm text-stone underline underline-offset-4 hover:text-ink"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex h-9 items-center rounded-full border border-line" role="group" aria-label={`Jumlah ${l.productName}`}>
                      <button
                        type="button"
                        onClick={() => setQuantity(l.variantId, l.quantity - 1)}
                        className="flex size-9 items-center justify-center"
                        aria-label="Kurangi"
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="tabular w-5 text-center text-sm">{l.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(l.variantId, l.quantity + 1)}
                        disabled={l.quantity >= Math.min(10, l.available)}
                        className="flex size-9 items-center justify-center disabled:opacity-30"
                        aria-label="Tambah"
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <p className="tabular text-sm">{formatRupiah(l.lineTotal)}</p>
                  </div>
                  {l.quantity > l.available && (
                    <p className="mt-2 text-sm text-danger">
                      {l.available > 0 ? `Stok tinggal ${l.available}. Kurangi jumlahnya.` : "Ukuran ini sudah habis. Hapus dari keranjang."}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isEmpty && !isLoading && (
        <div className="shrink-0 border-t border-line px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-baseline justify-between">
            <span>Subtotal</span>
            <span className="tabular text-lg">{formatRupiah(subtotal)}</span>
          </div>
          <p className="mt-1 text-sm text-stone">Ongkir dihitung di checkout.</p>
          <ButtonLink
            href="/checkout"
            onClick={close}
            variant="brand"
            size="lg"
            block
            aria-disabled={overStock}
            className={overStock ? "pointer-events-none mt-4 opacity-40" : "mt-4"}
          >
            Checkout
          </ButtonLink>
        </div>
      )}
    </dialog>
  );
}
