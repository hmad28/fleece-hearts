import type { DropWithStatus, ID, Product } from "@fh/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  lockedByProduct?: Map<ID, DropWithStatus>;
  priorityCount?: number;
  className?: string;
}

export function ProductGrid({ products, lockedByProduct, priorityCount = 2, className }: ProductGridProps) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-2 gap-y-10 md:gap-x-4 md:gap-y-14 lg:grid-cols-4", className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} upcomingDropCode={lockedByProduct?.get(p.id)?.code} />
        </li>
      ))}
    </ul>
  );
}
