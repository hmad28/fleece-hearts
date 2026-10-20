import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DropCountdown } from "@/components/drop/drop-countdown";
import { DropStatusLabel } from "@/components/drop/drop-status-label";
import { ProductGrid } from "@/components/product/product-grid";
import { Media } from "@/components/ui/media";
import { formatReleaseWIB } from "@/lib/datetime";
import { getDropContext } from "@/lib/drop-context";
import { dbCatalog, dbDrops } from "@/lib/storefront-data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { drops, serverNow } = await dbDrops();
  const drop = drops.find((item) => item.slug === slug);
  const res = drop ? { drop, serverNow } : null;
  return { title: res ? `${res.drop.code} — ${res.drop.name}` : "Drop tidak ditemukan" };
}

export default async function DropPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { drops, serverNow, lockedByProduct } = await getDropContext();
  const drop = drops.find((d) => d.slug === slug);
  if (!drop) notFound();

  const products = await dbCatalog.getProductsByIds(drop.productIds);
  const upcoming = drop.status === "UPCOMING";

  return (
    <>
      <section className={upcoming ? "bg-brand text-ink" : "bg-ink text-paper"}>
        <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 py-12 md:grid-cols-[1fr_1fr] md:px-8 md:py-20">
          <div>
            <div className="flex items-center gap-3">
              <DropStatusLabel status={drop.status} />
              <p className="text-sm">{formatReleaseWIB(drop.releaseAt)}</p>
            </div>
            <h1 className="font-display mt-6 text-[clamp(5rem,16vw,13rem)]">{drop.code}</h1>
            <p className="mt-4 text-xl md:text-2xl">{drop.name}</p>
            {drop.tagline && <p className="mt-2 max-w-xl opacity-70">{drop.tagline}</p>}
            {upcoming && (
              <div className="mt-12">
                <DropCountdown releaseAt={drop.releaseAt} serverNow={serverNow} />
              </div>
            )}
            {drop.description && <p className="mt-10 max-w-lg leading-relaxed">{drop.description}</p>}
          </div>
          <Media asset={drop.banner} priority sizes="(min-width: 768px) 45vw, 92vw" className="aspect-[16/10] w-full" />
        </div>
      </section>

      <section aria-labelledby="drop-products" className="mx-auto max-w-[90rem] px-4 pt-16 md:px-8 md:pt-24">
        <h2 id="drop-products" className="font-display text-[clamp(2rem,4vw,3rem)]">
          {products.length} produk di {drop.code}
        </h2>
        {upcoming && (
          <p className="mt-2 text-stone">Produk bisa dilihat sekarang, tombol beli terbuka saat rilis.</p>
        )}
        <div className="mt-8">
          <ProductGrid products={products} lockedByProduct={lockedByProduct} />
        </div>
      </section>
    </>
  );
}
