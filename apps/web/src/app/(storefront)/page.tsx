import Link from "next/link";
import { connection } from "next/server";
import { DropCountdown } from "@/components/drop/drop-countdown";
import { ProductGrid } from "@/components/product/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { homeCopy } from "@/config/content";
import { formatReleaseWIB } from "@/lib/datetime";
import { getDropContext } from "@/lib/drop-context";
import { getSiteContent } from "@/lib/site-content";
import { dbCatalog } from "@/lib/storefront-data";

export default async function HomePage() {
  // Countdown & status drop bergantung jam server → render per request.
  await connection();

  const [{ serverNow, featured: drop, lockedByProduct }, latest, categories, content] = await Promise.all([
    getDropContext(),
    dbCatalog.listProducts({ sort: "newest", perPage: 8 }),
    dbCatalog.listCategories(),
    getSiteContent(),
  ]);
  const { looks, detail } = homeCopy;

  return (
    <div className="mx-auto w-full max-w-[90rem]">
      {/* HERO — foto campaign full-bleed. Desktop: teks di atas dinding kosong sebelah kiri. */}
      {drop && (
        <section aria-labelledby="hero-title" className="relative">
          <Media
            asset={drop.banner}
            priority
            sizes="100vw"
            className="aspect-[4/5] w-full md:hidden"
            imgClassName="object-[50%_30%]"
          />
          <Media
            asset={drop.banner}
            priority
            sizes="100vw"
            className="hidden h-[calc(100svh-6.25rem)] max-h-[56rem] min-h-[36rem] w-full md:block"
            imgClassName="object-[72%_center]"
          />
          {/* Lapisan pasir tipis di kiri supaya teks tetap terbaca di atas pintu/tanaman. */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-[#dcc49c]/90 via-[#dcc49c]/55 to-transparent md:block" />
          <div className="px-4 pt-8 pb-4 md:absolute md:inset-y-0 md:left-0 md:flex md:w-1/2 md:flex-col md:justify-end md:px-10 md:pb-14 lg:px-14">
            <p className="text-sm">
              {content.heroEyebrow} · {drop.status === "UPCOMING" ? formatReleaseWIB(drop.releaseAt) : "Sudah rilis"}
            </p>
            <h1 id="hero-title" className="font-display mt-3 text-[clamp(4rem,10vw,10rem)]">
              {drop.code}
              <br />
              {drop.name}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed">{content.heroBody}</p>
            <div className="mt-7 flex flex-wrap items-end gap-x-10 gap-y-6">
              <ButtonLink href={`/drops/${drop.slug}`} size="lg">
                {drop.status === "UPCOMING" ? "Lihat koleksi" : "Belanja drop"}
              </ButtonLink>
              {drop.status === "UPCOMING" && <DropCountdown releaseAt={drop.releaseAt} serverNow={serverNow} size="sm" />}
            </div>
          </div>
        </section>
      )}

      {/* BARU MASUK */}
      {content.showLatest && <section aria-labelledby="latest-heading" className="px-4 pt-20 md:px-10 md:pt-28 lg:px-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="latest-heading" className="font-display text-[clamp(2.25rem,4.5vw,4rem)]">
            Baru masuk
          </h2>
          <Link href="/shop" className="text-sm underline underline-offset-4">
            Lihat semua
          </Link>
        </div>
        <div className="mt-8 md:mt-10">
          <ProductGrid products={latest.items} lockedByProduct={lockedByProduct} />
        </div>
      </section>}

      {/* LOOKBOOK — dua foto full-bleed berdampingan */}
      {content.showLookbook && <section aria-label="Lookbook" className="mt-24 grid md:mt-32 md:grid-cols-2">
        {looks.map((l) => (
          <Link key={l.href} href={l.href} className="group relative block">
            <Media
              asset={{ url: l.image, alt: l.alt }}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/5] w-full"
              imgClassName="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/55 to-transparent px-4 pt-24 pb-5 text-paper md:px-8 md:pb-7">
              <p className="font-display text-[clamp(1.75rem,3vw,2.75rem)]">{l.title}</p>
              <span className="shrink-0 pb-1 text-sm underline underline-offset-4">Belanja</span>
            </div>
          </Link>
        ))}
      </section>}

      {/* Detail bahan memakai warna brand maroon. */}
      {content.showMaterial && <section aria-labelledby="detail-heading" className="bg-brand text-paper">
        <div className="grid md:grid-cols-2">
          <Media
            asset={{ url: detail.image, alt: detail.imageAlt }}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/5] w-full md:aspect-auto md:min-h-[44rem]"
          />
          <div className="flex flex-col justify-center px-4 py-14 md:px-12 lg:px-20">
            <h2 id="detail-heading" className="font-display max-w-[10ch] text-[clamp(2.75rem,5.5vw,5.5rem)]">
              {detail.title}
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed">{detail.body}</p>
            <dl className="mt-10 grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-paper/40 pt-6 text-sm">
              {detail.specs.map((s) => (
                <div key={s.label} className="contents">
                  <dt className="text-paper/70">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href={detail.href} variant="ink" size="lg" className="mt-10 self-start">
              Lihat Polar Fleece Zip
            </ButtonLink>
          </div>
        </div>
      </section>}

      {/* KATEGORI — daftar tipografis */}
      {content.showCategories && <section aria-labelledby="category-heading" className="px-4 pt-24 md:px-10 md:pt-32 lg:px-14">
        <h2 id="category-heading" className="text-sm text-stone">
          Belanja per kategori
        </h2>
        <ul className="font-display mt-4 flex flex-wrap gap-x-[0.35em] text-[clamp(2.5rem,7vw,6.5rem)]">
          {categories.map((c, i) => (
            <li key={c.id} className="flex">
              <Link href={`/shop?category=${c.slug}`} className="decoration-[0.06em] underline-offset-[0.12em] hover:underline">
                {c.name}
              </Link>
              {i < categories.length - 1 && <span className="text-stone/40">,</span>}
            </li>
          ))}
        </ul>
      </section>}
    </div>
  );
}
