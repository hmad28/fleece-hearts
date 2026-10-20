import type { Product } from "@fh/types";
import { formatRupiah, getProductStockStatus } from "@fh/shared";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
  const title = product.colorway ? `${product.name} – ${product.colorway}` : product.name;
  const cover = product.images[0] ?? { url: null, alt: title };
  const alt = product.images[1];

  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-sm">
      <div className="relative">
        <Media
          asset={cover}
          sizes="(min-width: 1024px) 25vw, 50vw"
          priority={priority}
          className="aspect-[4/5] w-full"
        />
        {alt?.url && (
          // Foto kedua muncul saat hover (desktop saja).
          <div aria-hidden className="absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
            <Media asset={{ url: alt.url, alt: "" }} sizes="(min-width: 1024px) 25vw, 50vw" className="h-full w-full" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          {upcomingDropCode ? (
            <Badge tone="brand">Rilis {upcomingDropCode}</Badge>
          ) : soldOut ? (
            <Badge tone="ink">Habis</Badge>
          ) : stock === "LOW_STOCK" ? (
            <Badge tone="outline">Stok terbatas</Badge>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-0.5 text-[0.95rem] sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h3 className={soldOut ? "text-stone" : "group-hover:underline group-hover:underline-offset-4"}>{title}</h3>
        <p className="tabular shrink-0 sm:text-right">
          {product.compareAtPrice && (
            <s className="mr-1.5 text-stone">{formatRupiah(product.compareAtPrice)}</s>
          )}
          <span>{formatRupiah(product.price)}</span>
        </p>
      </div>
    </Link>
  );
}
