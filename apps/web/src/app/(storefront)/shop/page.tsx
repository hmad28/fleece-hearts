import type { ProductListQuery } from "@fh/types";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { getDropContext } from "@/lib/drop-context";
import { cn } from "@/lib/utils";
import { services } from "@/services";

export const metadata: Metadata = { title: "Shop" };

type SearchParams = Record<string, string | string[] | undefined>;

const SORTS: { value: NonNullable<ProductListQuery["sort"]>; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga terendah" },
  { value: "price_desc", label: "Harga tertinggi" },
];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const search = one(sp.q)?.trim().slice(0, 100) ?? "";
  const category = one(sp.category);
  const size = one(sp.size);
  const available = one(sp.available) === "1";
  const sortParam = one(sp.sort);
  const sort = SORTS.some((s) => s.value === sortParam) ? (sortParam as ProductListQuery["sort"]) : "newest";

  const [categories, all, result, { lockedByProduct }] = await Promise.all([
    services.catalog.listCategories(),
    services.catalog.listProducts({ perPage: 1000 }),
    services.catalog.listProducts({ search, categorySlug: category, size, availableOnly: available, sort, perPage: 48 }),
    getDropContext(),
  ]);

  const sizes = [...new Set(all.items.flatMap((p) => p.variants.map((v) => v.size)))];
  const activeCategory = categories.find((c) => c.slug === category);

  /** Bangun URL filter dengan mempertahankan filter lain. */
  const href = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: search, category, size, available: available ? "1" : undefined, sort: sort === "newest" ? undefined : sort, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const qs = next.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  const hasFilter = Boolean(search || category || size || available);

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-10 md:px-8 md:pt-16">
      <h1 className="font-display text-[clamp(3rem,10vw,7rem)]">{activeCategory?.name ?? "Shop"}</h1>

      <form action="/shop" className="mt-8 flex max-w-xl gap-2" role="search">
        <label htmlFor="shop-search" className="sr-only">Cari produk</label>
        <input id="shop-search" name="q" type="search" defaultValue={search} placeholder="Cari nama produk atau warna" className="h-12 min-w-0 flex-1 rounded-full border border-line bg-paper px-5 outline-none focus:border-ink" />
        {category && <input type="hidden" name="category" value={category} />}
        {size && <input type="hidden" name="size" value={size} />}
        {available && <input type="hidden" name="available" value="1" />}
        {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
        <button type="submit" className="h-12 rounded-full bg-ink px-6 text-paper">Cari</button>
      </form>

      <div className="sticky top-16 z-30 -mx-4 mt-8 border-y border-line bg-paper/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <nav aria-label="Kategori" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          <FilterChip href={href({ category: undefined })} active={!category}>
            Semua
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} href={href({ category: c.slug })} active={category === c.slug}>
              {c.name}
            </FilterChip>
          ))}
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Ukuran">
            <span className="mr-1 text-stone">Ukuran</span>
            {sizes.map((s) => (
              <FilterChip key={s} small href={href({ size: size === s ? undefined : s })} active={size === s}>
                {s}
              </FilterChip>
            ))}
          </div>
          <FilterChip small href={href({ available: available ? undefined : "1" })} active={available}>
            Hanya yang tersedia
          </FilterChip>
          <div className="flex flex-wrap items-center gap-1 md:ml-auto" role="group" aria-label="Urutkan">
            <span className="mr-1 text-stone">Urutkan</span>
            {SORTS.map((s) => (
              <FilterChip key={s.value} small href={href({ sort: s.value === "newest" ? undefined : s.value })} active={sort === s.value}>
                {s.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-stone" aria-live="polite">
        {result.total} produk{search ? ` untuk “${search}”` : ""}
      </p>

      <div className="mt-4">
        {result.items.length > 0 ? (
          <ProductGrid products={result.items} lockedByProduct={lockedByProduct} />
        ) : (
          <div className="py-24">
            <p className="text-lg">Belum ada produk yang cocok dengan filter ini.</p>
            {hasFilter && (
              <Link href="/shop" className="mt-3 inline-block text-sm underline underline-offset-4">
                Hapus semua filter
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  small,
  children,
}: {
  href: string;
  active: boolean;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border whitespace-nowrap transition-colors",
        small ? "h-8 px-3 text-sm" : "h-9 px-4 text-sm",
        active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}
