"use client";

import { ShoppingBag } from "lucide-react";
import { useSyncExternalStore } from "react";
import { selectItemCount, useCartStore } from "@/stores/cart-store";

/** Hindari mismatch hydration: jumlah item dari localStorage baru dibaca di client. */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function CartButton() {
  const count = useCartStore(selectItemCount);
  const open = useCartStore((s) => s.open);
  const hydrated = useHydrated();
  const shown = hydrated ? count : 0;

  return (
    <button
      type="button"
      onClick={open}
      className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-mist"
      aria-label={shown > 0 ? `Keranjang, ${shown} barang` : "Keranjang kosong"}
    >
      <ShoppingBag className="size-5" strokeWidth={1.75} aria-hidden />
      {shown > 0 && (
        <span className="tabular absolute top-1 right-1 flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] leading-5 font-medium text-ink">
          {shown}
        </span>
      )}
    </button>
  );
}
