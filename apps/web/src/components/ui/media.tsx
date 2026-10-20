import type { MediaAsset } from "@fh/types";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaProps {
  asset: Pick<MediaAsset, "url" | "alt">;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Teks kecil di placeholder saat foto asli belum ada. */
  placeholderLabel?: string;
  tone?: "mist" | "ink";
  /** Posisi label placeholder; "top" untuk hero yang bagian bawahnya tertutup teks. */
  labelAt?: "top" | "bottom";
}

/**
 * Foto produk/banner. Kalau `url` null (foto klien belum ada), tampilkan placeholder netral
 * dengan ukuran yang sama — layout tidak berubah saat foto asli masuk.
 */
export function Media({ asset, className, sizes = "100vw", priority, placeholderLabel = "Foto menyusul", tone = "mist", labelAt = "bottom" }: MediaProps) {
  if (asset.url) {
    return (
      <div className={cn("relative overflow-hidden bg-mist", className)}>
        <Image
          src={asset.url}
          alt={asset.alt}
          fill
          sizes={sizes}
          priority={priority}
          // Ilustrasi dummy berupa SVG: tidak perlu dioptimasi.
          unoptimized={asset.url.endsWith(".svg")}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={asset.alt}
      className={cn(
        "relative flex overflow-hidden p-3",
        labelAt === "top" ? "items-start justify-end" : "items-end",
        tone === "ink" ? "bg-[#1e1e1e] text-paper/50" : "bg-mist text-stone",
        className,
      )}
    >
      <span className="text-xs">{placeholderLabel}</span>
    </div>
  );
}
