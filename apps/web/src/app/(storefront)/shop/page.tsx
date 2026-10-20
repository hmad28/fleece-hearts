import type { ProductListQuery } from "@fh/types";
import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { getDropContext } from "@/lib/drop-context";
import { cn } from "@/lib/utils";
import { dbCatalog } from "@/lib/storefront-data";

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
    dbCatalog.listCategories(),
    dbCatalog.listProducts({ perPage: 1000 }),
    dbCatalog.listProducts({ search, categorySlug: category, size, availableOnly: available, sort, perPage: 48 }),
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

  const filterCount = Number(Boolean(category)) + Number(Boolean(size)) + Number(available);
  const filters = (
    <div className="space-y-8">
      <FilterGroup title="Kategori">
        <FilterOption href={href({ category: undefined })} active={!category}>Semua produk</FilterOption>
        {categories.map((c) => (
          <FilterOption key={c.id} href={href({ category: c.slug })} active={category === c.slug}>{c.name}</FilterOption>
        ))}
      </FilterGroup>
      {sizes.length > 0 && (
        <FilterGroup title="Ukuran">
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <FilterChip key={s} href={href({ size: size === s ? undefined : s })} active={size === s}>{s}</FilterChip>
            ))}
          </div>
        </FilterGroup>
      )}
      <FilterGroup title="Ketersediaan">
        <FilterOption href={href({ available: available ? undefined : "1" })} active={available}>Hanya yang tersedia</FilterOption>
      </FilterGroup>
      <FilterGroup title="Urutkan">
        {SORTS.map((s) => (
          <FilterOption key={s.value} href={href({ sort: s.value === "newest" ? undefined : s.value })} active={sort === s.value}>{s.label}</FilterOption>
        ))}
      </FilterGroup>
      {hasFilter && <Link href="/shop" className="inline-block text-sm underline underline-offset-4">Hapus semua filter</Link>}
    </div>
  );

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-9 md:px-8 md:pt-14">
      <div className="border-b border-line pb-7 md:pb-10">
        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-stone uppercase">Katalog Fleece Hearts</p>
        <h1 className="font-display text-[clamp(3.5rem,9vw,7rem)]">{activeCategory?.name ?? "Shop"}</h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone">Temukan pilihan yang pas. Gunakan pencarian dan filter untuk mempersempit katalog.</p>
      </div>

      <form action="/shop" className="mt-7 flex max-w-2xl gap-2" role="search">
        <label htmlFor="shop-search" className="sr-only">Cari produk</label>
        <input id="shop-search" name="q" type="search" defaultValue={search} placeholder="Cari nama produk atau warna" className="h-12 min-w-0 flex-1 rounded-full border border-line bg-paper px-5 outline-none focus:border-ink" />
        {category && <input type="hidden" name="category" value={category} />}
        {size && <input type="hidden" name="size" value={size} />}
        {available && <input type="hidden" name="available" value="1" />}
        {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
        <button type="submit" className="h-12 rounded-full bg-ink px-6 text-paper">Cari</button>
      </form>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside aria-label="Filter katalog" className="hidden border-t border-ink pt-5 lg:sticky lg:top-24 lg:block">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filter & urutkan</h2>
            <SlidersHorizontal className="size-4" strokeWidth={1.5} aria-hidden />
          </div>
          {filters}
        </aside>

        <section aria-label="Daftar produk" className="min-w-0">
          <details className="mb-6 border-y border-line lg:hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2"><SlidersHorizontal className="size-4" aria-hidden /> Filter & urutkan{filterCount > 0 ? ` (${filterCount})` : ""}</span>
              <span className="text-xs text-stone">Buka / tutup</span>
            </summary>
            <div className="border-t border-line py-6">{filters}</div>
          </details>

          <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-line pb-4">
            <h2 className="text-sm font-medium" aria-live="polite">
              {result.total} produk{search ? ` untuk “${search}”` : ""}
            </h2>
            {hasFilter && <Link href="/shop" className="text-xs text-stone underline underline-offset-4 lg:hidden">Reset filter</Link>}
          </div>

          {result.items.length > 0 ? (
            <ProductGrid products={result.items} lockedByProduct={lockedByProduct} className="lg:grid-cols-3" />
          ) : (
            <div className="py-24">
              <p className="text-lg">Belum ada produk yang cocok dengan filter ini.</p>
              {hasFilter && <Link href="/shop" className="mt-3 inline-block text-sm underline underline-offset-4">Hapus semua filter</Link>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div className="border-b border-line pb-7"><h3 className="mb-4 text-xs font-semibold tracking-[0.12em] text-stone uppercase">{title}</h3>{children}</div>;
}

function FilterOption({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return <Link href={href} scroll={false} aria-current={active ? "true" : undefined} className={cn("flex min-h-9 items-center gap-3 text-sm transition-colors hover:text-ink", active ? "font-medium text-ink" : "text-stone")}><span className={cn("size-3.5 shrink-0 rounded-full border", active ? "border-ink bg-ink shadow-[inset_0_0_0_3px_var(--color-paper)]" : "border-stone")} aria-hidden />{children}</Link>;
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border whitespace-nowrap transition-colors",
        "h-9 min-w-9 justify-center px-3 text-sm",
        active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}
