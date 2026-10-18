import type { DropWithStatus, ID, Product } from "@fh/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  lockedByProduct?: Map<ID, DropWithStatus>;
  priorityCount?: number;
}

export function ProductGrid({ products, lockedByProduct, priorityCount = 2 }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} upcomingDropCode={lockedByProduct?.get(p.id)?.code} />
        </li>
      ))}
    </ul>
  );
}
