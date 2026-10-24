"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Wishlist = { productIds: string[] };

export function WishlistButton({ productId, productName, variant = "icon" }: { productId: string; productName: string; variant?: "icon" | "text" }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data } = useQuery<Wishlist>({ queryKey: ["account-wishlist"], queryFn: async () => {
    const response = await fetch("/api/account/wishlist");
    if (response.status === 401) return { productIds: [] };
    if (!response.ok) throw new Error("Wishlist gagal dimuat");
    return response.json();
  }, staleTime: 60_000, retry: false });
  const saved = data?.productIds.includes(productId) ?? false;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/account/wishlist", { method: saved ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
      if (response.status === 401) { router.push("/auth"); return; }
      if (!response.ok) throw new Error("Wishlist gagal diperbarui");
      queryClient.setQueryData<Wishlist>(["account-wishlist"], (current) => ({ productIds: saved ? (current?.productIds ?? []).filter((id) => id !== productId) : [...(current?.productIds ?? []), productId] }));
      void queryClient.invalidateQueries({ queryKey: ["account-wishlist"] });
      router.refresh();
    } catch { /* Tombol tetap pada keadaan sebelumnya; pengguna bisa mencoba lagi. */ }
    finally { setBusy(false); }
  }

  return <button type="button" onClick={() => void toggle()} disabled={busy} aria-pressed={saved} aria-label={`${saved ? "Hapus" : "Simpan"} ${productName} ${saved ? "dari" : "ke"} wishlist`} className={variant === "icon" ? "flex size-10 items-center justify-center rounded-full bg-white/95 text-brand shadow-sm transition-transform hover:scale-105 disabled:opacity-60" : "inline-flex items-center gap-2 rounded-full border border-[#e7e0d9] px-4 py-2 text-sm font-semibold text-brand hover:bg-[#f9eeee] disabled:opacity-60"}><Heart className="size-5" fill={saved ? "currentColor" : "none"} strokeWidth={1.8} />{variant === "text" && (saved ? "Tersimpan di wishlist" : "Simpan ke wishlist")}</button>;
}
