import type { DropWithStatus, ID, Product } from "@fh/types";
import { cn } from "@/lib/utils";
import { ProductCard, type Swatch } from "./product-card";

interface ProductGridProps {
  products: Product[];
  lockedByProduct?: Map<ID, DropWithStatus>;
  priorityCount?: number;
  /** Katalog lengkap untuk swatch warna lain dari model yang sama (default: products). */
  allProducts?: Product[];
  className?: string;
}

export function ProductGrid({ products, lockedByProduct, priorityCount = 2, allProducts, className }: ProductGridProps) {
  const swatchesByName = new Map<string, Swatch[]>();
  for (const p of allProducts ?? products) {
    const list = swatchesByName.get(p.name) ?? [];
    if (!list.some((s) => s.slug === p.slug)) list.push({ slug: p.slug, colorway: p.colorway ?? "", hex: p.variants[0]?.colorHex ?? "#ccc" });
    swatchesByName.set(p.name, list);
  }
  return (
    <ul className={cn("grid grid-cols-2 gap-x-2 gap-y-10 md:gap-x-4 md:gap-y-14 lg:grid-cols-4", className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard
            product={p}
            priority={i < priorityCount}
            upcomingDropCode={lockedByProduct?.get(p.id)?.code}
            swatches={swatchesByName.get(p.name)}
          />
        </li>
      ))}
    </ul>
  );
}
