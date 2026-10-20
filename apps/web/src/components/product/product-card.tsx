import type { Product } from "@fh/types";
import { formatRupiah, getProductStockStatus } from "@fh/shared";
import Link from "next/link";
import { Media } from "@/components/ui/media";

interface ProductCardProps {
  product: Product;
  /** Diisi kalau produk bagian dari drop yang belum rilis. */
  upcomingDropCode?: string;
  priority?: boolean;
}

export function ProductCard({ product, upcomingDropCode, priority }: ProductCardProps) {
  const stock = getProductStockStatus(product);
  const soldOut = stock === "OUT_OF_STOCK";
  const cover = product.images[0] ?? { url: null, alt: product.name };
  const alt = product.images[1];
  const tag = upcomingDropCode
    ? `Rilis ${upcomingDropCode}`
    : soldOut
      ? "Habis"
      : stock === "LOW_STOCK"
        ? "Sisa sedikit"
        : null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative">
        <Media asset={cover} sizes="(min-width: 1024px) 25vw, 50vw" priority={priority} className="aspect-[4/5] w-full" />
        {alt?.url && (
          // Foto lookbook muncul saat hover (desktop saja).
          <div aria-hidden className="absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block">
            <Media asset={{ url: alt.url, alt: "" }} sizes="(min-width: 1024px) 25vw, 50vw" className="h-full w-full" />
          </div>
        )}
        {tag && (
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs leading-none ${
              upcomingDropCode ? "bg-brand text-ink" : "bg-paper text-ink"
            }`}
          >
            {tag}
          </span>
        )}
      </div>
      <div className="mt-3 text-sm leading-snug">
        <h3 className={soldOut ? "text-stone" : "group-hover:underline group-hover:underline-offset-4"}>{product.name}</h3>
        <p className="mt-0.5 flex flex-wrap gap-x-2 text-stone">
          {product.colorway && <span>{product.colorway}</span>}
          <span className="tabular text-ink">
            {product.compareAtPrice && <s className="mr-1.5 text-stone">{formatRupiah(product.compareAtPrice)}</s>}
            {formatRupiah(product.price)}
          </span>
        </p>
      </div>
    </Link>
  );
}
