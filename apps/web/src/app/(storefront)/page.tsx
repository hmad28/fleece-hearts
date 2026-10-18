import Link from "next/link";
import { connection } from "next/server";
import { DropCountdown } from "@/components/drop/drop-countdown";
import { ProductGrid } from "@/components/product/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { formatReleaseWIB } from "@/lib/datetime";
import { getDropContext } from "@/lib/drop-context";
import { services } from "@/services";

export default async function HomePage() {
  // Countdown & status drop bergantung jam server → render per request.
  await connection();

  const [{ serverNow, featured: featuredDrop, lockedByProduct }, latest, categories] = await Promise.all([
    getDropContext(),
    services.catalog.listProducts({ sort: "newest", perPage: 8 }),
    services.catalog.listCategories(),
  ]);

  return (
    <>
      {/* Hero: foto campaign. Saat foto asli belum ada, tampil placeholder gelap. */}
      <section className="relative">
        <Media
          asset={featuredDrop?.banner ?? { url: null, alt: "Foto campaign Fleece Hearts" }}
          tone="ink"
          labelAt="top"
          priority
          placeholderLabel="Foto campaign menyusul"
          className="h-[78svh] min-h-[28rem] w-full"
        />
        {featuredDrop && (
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[90rem] px-4 pb-10 text-paper md:px-8 md:pb-14">
            <h1 className="font-display text-[clamp(4rem,14vw,12rem)]">{featuredDrop.code}</h1>
            <p className="mt-3 max-w-md text-base text-paper/80 md:text-lg">{featuredDrop.name}</p>
            <ButtonLink href={`/drops/${featuredDrop.slug}`} variant="outline" className="mt-6 border-paper text-paper hover:bg-paper hover:text-ink">
              Lihat drop
            </ButtonLink>
          </div>
        )}
      </section>

      {/* Satu-satunya blok kuning di halaman: hitung mundur drop. */}
      {featuredDrop?.status === "UPCOMING" && (
        <section aria-labelledby="drop-heading" className="bg-brand text-ink">
          <div className="mx-auto max-w-[90rem] px-4 py-14 md:px-8 md:py-20">
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <h2 id="drop-heading" className="font-display text-[clamp(2rem,5vw,3.5rem)]">
                {featuredDrop.code} rilis dalam
              </h2>
              <p className="text-base md:text-lg">{formatReleaseWIB(featuredDrop.releaseAt)}</p>
            </div>
            <div className="mt-8 md:mt-12">
              <DropCountdown releaseAt={featuredDrop.releaseAt} serverNow={serverNow} />
            </div>
            <ButtonLink href={`/drops/${featuredDrop.slug}`} variant="onBrand" size="lg" className="mt-10">
              Intip koleksinya
            </ButtonLink>
          </div>
        </section>
      )}

      <section aria-labelledby="latest-heading" className="mx-auto max-w-[90rem] px-4 pt-20 md:px-8 md:pt-28">
        <div className="flex items-end justify-between gap-4">
          <h2 id="latest-heading" className="font-display text-[clamp(2.25rem,5vw,4rem)]">
            Baru masuk
          </h2>
          <Link href="/shop" className="pb-1 text-sm underline underline-offset-4">
            Lihat semua produk
          </Link>
        </div>
        <div className="mt-8 md:mt-12">
          <ProductGrid products={latest.items} lockedByProduct={lockedByProduct} />
        </div>
      </section>

      <section aria-labelledby="category-heading" className="mx-auto max-w-[90rem] px-4 pt-24 md:px-8 md:pt-32">
        <h2 id="category-heading" className="sr-only">
          Belanja per kategori
        </h2>
        <ul className="border-t border-ink">
          {categories.map((c) => (
            <li key={c.id} className="border-b border-ink">
              <Link
                href={`/shop?category=${c.slug}`}
                className="font-display flex items-center justify-between py-5 text-[clamp(2.25rem,7vw,5.5rem)] transition-colors hover:bg-brand md:px-4"
              >
                {c.name}
                <span className="font-sans text-sm">Belanja</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
