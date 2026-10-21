import type { Product } from "@fh/types";
import { formatRupiah } from "@fh/shared";
import Link from "next/link";
import { Media } from "@/components/ui/media";
import { LiveStockTag, QuickAdd } from "./product-card-live";

export interface Swatch {
  slug: string;
  colorway: string;
  hex: string;
}

interface ProductCardProps {
  product: Product;
  /** Diisi kalau produk bagian dari drop yang belum rilis. */
  upcomingDropCode?: string;
  /** Warna lain dari model yang sama (termasuk produk ini). */
  swatches?: Swatch[];
  priority?: boolean;
}

export function ProductCard({ product, upcomingDropCode, swatches = [], priority }: ProductCardProps) {
  const cover = product.images[0] ?? { url: null, alt: product.name };
  const alt = product.images[1];
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  return (
    <article className="group relative">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden className="block">
          <Media
            asset={cover}
            sizes="(min-width: 1024px) 25vw, 50vw"
            priority={priority}
            className="aspect-[4/5] w-full"
            imgClassName="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
          {alt?.url && (
            // Foto lookbook muncul saat hover (desktop saja).
            <div className="absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block">
              <Media asset={{ url: alt.url, alt: "" }} sizes="(min-width: 1024px) 25vw, 50vw" className="h-full w-full" />
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          <LiveStockTag product={product} upcomingDropCode={upcomingDropCode} />
          {discount > 0 && <span className="rounded-full bg-ink px-2.5 py-1 text-xs leading-none text-paper">−{discount}%</span>}
        </div>
        {!upcomingDropCode && <QuickAdd product={product} />}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 text-sm leading-snug">
        <div className="min-w-0">
          <h3>
            <Link href={`/products/${product.slug}`} className="hover:underline hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-stone">{product.colorway}</p>
        </div>
        <p className="tabular shrink-0 text-right">
          {product.compareAtPrice && <s className="block text-xs text-stone">{formatRupiah(product.compareAtPrice)}</s>}
          {formatRupiah(product.price)}
        </p>
      </div>

      {swatches.length > 1 && (
        <ul className="mt-2.5 flex gap-1.5" aria-label="Pilihan warna">
          {swatches.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/products/${s.slug}`}
                aria-label={s.colorway}
                title={s.colorway}
                aria-current={s.slug === product.slug ? "true" : undefined}
                className={`block size-4 rounded-full border border-ink/20 ${s.slug === product.slug ? "ring-1 ring-ink ring-offset-2 ring-offset-paper" : ""}`}
                style={{ backgroundColor: s.hex }}
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
