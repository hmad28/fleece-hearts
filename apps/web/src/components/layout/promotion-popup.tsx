"use client";

import { useEffect, useRef } from "react";

const seenKey = "fh-promotion-seen";

/** Satu tampilan per tab; konten popup hanya gambar. Escape atau klik menutupnya. */
export function PromotionPopup({ imageUrl }: { imageUrl: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!imageUrl || sessionStorage.getItem(seenKey)) return;
    const timer = window.setTimeout(() => {
      if (!dialog.current || dialog.current.open) return;
      dialog.current.showModal();
      dialog.current.focus();
      sessionStorage.setItem(seenKey, "1");
    }, 150);
    return () => window.clearTimeout(timer);
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <dialog
      ref={dialog}
      tabIndex={-1}
      aria-label="Gambar promosi Fleece Hearts. Tekan Escape atau klik gambar untuk menutup."
      onClick={() => dialog.current?.close()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") dialog.current?.close();
      }}
      className="fixed inset-0 m-auto max-h-[90svh] max-w-[min(94vw,64rem)] cursor-pointer overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-2xl outline-none backdrop:bg-ink/75 backdrop:backdrop-blur-sm"
    >
      {/* Promo dari CMS dapat berorientasi potret atau lanskap; ukuran asli dipertahankan. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Promosi Fleece Hearts"
        loading="eager"
        className="block max-h-[90svh] w-auto max-w-full object-contain"
      />
    </dialog>
  );
}
