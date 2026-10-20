import { formatRupiah } from "@fh/shared";
import Link from "next/link";
import { connection } from "next/server";
import { LogoMark } from "@/components/brand/wordmark";
import { DropCountdown } from "@/components/drop/drop-countdown";
import { ProductGrid } from "@/components/product/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { homeCopy } from "@/config/content";
import { formatReleaseWIB } from "@/lib/datetime";
import { getDropContext } from "@/lib/drop-context";
import { services } from "@/services";

export default async function HomePage() {
  // Countdown & status drop bergantung jam server → render per request.
  await connection();

  const [{ serverNow, featured: drop, lockedByProduct }, latest, all, categories] = await Promise.all([
    getDropContext(),
    services.catalog.listProducts({ sort: "newest", perPage: 8 }),
    services.catalog.listProducts({ perPage: 1000 }),
    services.catalog.listCategories(),
  ]);

  const featured = all.items.filter((p) => p.isFeatured && !lockedByProduct.has(p.id));
  const heroA = featured[0];
  const heroB = featured[1];
  const categoryTiles = categories
    .map((c) => ({ category: c, cover: all.items.find((p) => p.categoryId === c.id)?.images[0] }))
    .filter((t) => t.cover);

  return (
    <>
      {/* HERO */}
      <section className="overflow-hidden bg-sand">
        <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 pt-10 pb-14 md:grid-cols-[1.05fr_1fr] md:gap-6 md:px-8 md:py-20">
          <div>
            <LogoMark draw title="Fleece Hearts" className="h-20 w-auto md:h-28" />
            <h1 className="font-display mt-8 max-w-[11ch] text-[clamp(3.25rem,8.5vw,7.5rem)]">{homeCopy.hero.title}</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed">{homeCopy.hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop" size="lg">
                Belanja sekarang
              </ButtonLink>
              {drop && (
                <ButtonLink href={`/drops/${drop.slug}`} variant="outline" size="lg">
                  Lihat drop {drop.code}
                </ButtonLink>
              )}
            </div>
          </div>

          {heroA && heroB && (
            <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
              <Link
                href={`/products/${heroB.slug}`}
                className="absolute top-[6%] right-0 w-[58%] rotate-[4deg] shadow-[0_18px_40px_-20px_rgba(0,0,0,.45)] transition-transform duration-300 hover:rotate-[2deg]"
              >
                <Media asset={heroB.images[1] ?? heroB.images[0]!} sizes="(min-width: 768px) 22vw, 55vw" className="aspect-[4/5] w-full" />
              </Link>
              <Link
                href={`/products/${heroA.slug}`}
                className="absolute bottom-[2%] left-0 w-[62%] -rotate-[5deg] shadow-[0_18px_40px_-20px_rgba(0,0,0,.45)] transition-transform duration-300 hover:-rotate-[3deg]"
              >
                <Media asset={heroA.images[0]!} priority sizes="(min-width: 768px) 24vw, 60vw" className="aspect-[4/5] w-full" />
              </Link>
              <span className="absolute right-[4%] bottom-[8%] rounded-full bg-paper px-4 py-2 text-sm shadow-sm">
                {heroA.name} · {formatRupiah(heroA.price)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* DROP — satu-satunya blok kuning di halaman */}
      {drop && (
        <section aria-labelledby="drop-heading" className="bg-brand">
          <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 py-14 md:grid-cols-[1.3fr_1fr] md:px-8 md:py-20">
            <div>
              <p className="text-base md:text-lg">
                {drop.status === "UPCOMING" ? `Rilis ${formatReleaseWIB(drop.releaseAt)}` : "Sudah rilis"}
              </p>
              <h2 id="drop-heading" className="font-display mt-3 text-[clamp(2.75rem,7vw,6rem)]">
                {drop.code} {drop.name}
              </h2>
              {drop.tagline && <p className="mt-4 max-w-md text-lg">{drop.tagline}</p>}
              {drop.status === "UPCOMING" && (
                <div className="mt-10">
                  <DropCountdown releaseAt={drop.releaseAt} serverNow={serverNow} />
                </div>
              )}
              <ButtonLink href={`/drops/${drop.slug}`} variant="onBrand" size="lg" className="mt-10">
                {drop.status === "UPCOMING" ? "Intip koleksinya" : "Belanja drop ini"}
              </ButtonLink>
            </div>
            <Link href={`/drops/${drop.slug}`} className="block" tabIndex={-1} aria-hidden>
              <Media
                asset={{ url: "/mock/campaign/ch01-tall.svg", alt: "" }}
                sizes="(min-width: 768px) 38vw, 92vw"
                className="aspect-[4/5] w-full"
              />
            </Link>
          </div>
        </section>
      )}

      {/* BARU MASUK */}
      <section aria-labelledby="latest-heading" className="mx-auto max-w-[90rem] px-4 pt-20 md:px-8 md:pt-28">
        <div className="flex items-end justify-between gap-4">
          <h2 id="latest-heading" className="font-display text-[clamp(2.5rem,5vw,4.5rem)]">
            Baru masuk
          </h2>
          <Link href="/shop" className="pb-1.5 text-sm underline underline-offset-4">
            Lihat semua produk
          </Link>
        </div>
        <div className="mt-8 md:mt-12">
          <ProductGrid products={latest.items} lockedByProduct={lockedByProduct} />
        </div>
      </section>

      {/* KATEGORI */}
      <section aria-labelledby="category-heading" className="pt-24 md:pt-32">
        <h2 id="category-heading" className="font-display mx-auto max-w-[90rem] px-4 text-[clamp(2.5rem,5vw,4.5rem)] md:px-8">
          Belanja per kategori
        </h2>
        <ul className="mx-auto mt-8 flex max-w-[90rem] snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mt-12 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-8">
          {categoryTiles.map(({ category, cover }) => (
            <li key={category.id} className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto">
              <Link href={`/shop?category=${category.slug}`} className="group block">
                <Media asset={cover!} sizes="(min-width: 768px) 15vw, 42vw" className="aspect-[4/5] w-full transition-transform duration-300 group-hover:-translate-y-1" />
                <span className="mt-3 block text-base group-hover:underline group-hover:underline-offset-4">{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CERITA BRAND */}
      <section aria-labelledby="story-heading" className="mx-auto max-w-[90rem] px-4 pt-24 md:px-8 md:pt-32">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex aspect-[4/3] items-center justify-center bg-sand md:aspect-auto md:min-h-[32rem]">
            <LogoMark className="h-1/2 w-auto" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 id="story-heading" className="font-display text-[clamp(2.5rem,5vw,4.5rem)]">
              {homeCopy.story.title}
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed">{homeCopy.story.body}</p>
            <dl className="mt-10 grid gap-6 border-t border-ink pt-8 sm:grid-cols-3">
              {homeCopy.story.points.map((p) => (
                <div key={p.title}>
                  <dt className="font-medium">{p.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-stone">{p.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
