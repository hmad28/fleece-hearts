"use client";

import type { CartItem } from "@fh/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_QTY_PER_LINE = 10;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

/**
 * Cart client: hanya menyimpan referensi varian + qty.
 * Harga & stok selalu dihitung ulang dari katalog/backend saat ditampilkan & checkout.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? s.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, i.quantity + item.quantity) }
                  : i,
              )
            : [...s.items, { ...item, quantity: Math.min(MAX_QTY_PER_LINE, item.quantity) }];
          return { items, isOpen: true };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, quantity) } : i,
                ),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "fh-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export const selectItemCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
