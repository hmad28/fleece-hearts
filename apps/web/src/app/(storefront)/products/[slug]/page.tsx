import { formatRupiah } from "@fh/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchase } from "@/components/product/product-purchase";
import { formatReleaseShortWIB, formatReleaseWIB } from "@/lib/datetime";
import { getDropContext } from "@/lib/drop-context";
import { services } from "@/services";

type Params = Promise<{ slug: string }>;

function productTitle(p: { name: string; colorway?: string }) {
  return p.colorway ? `${p.name} – ${p.colorway}` : p.name;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await services.catalog.getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return { title: product.seo?.title ?? productTitle(product), description: product.seo?.description };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await services.catalog.getProductBySlug(slug);
  if (!product) notFound();

  const [all, { lockedByProduct }, sizeGuide] = await Promise.all([
    services.catalog.listProducts({ perPage: 1000 }),
    getDropContext(),
    product.sizeGuideId ? services.catalog.getSizeGuide(product.sizeGuideId) : Promise.resolve(null),
  ]);

  const title = productTitle(product);
  const lockedDrop = lockedByProduct.get(product.id);
  const colorways = all.items.filter((p) => p.name === product.name);
  const related = all.items.filter((p) => p.categoryId === product.categoryId && p.name !== product.name).slice(0, 4);

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-6 md:px-8 md:pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-stone">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span aria-hidden> / </span>
        <span className="text-ink">{title}</span>
      </nav>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-12 lg:gap-20">
        <ProductGallery images={product.images} title={title} />

        <div className="md:sticky md:top-24 md:self-start">
          {lockedDrop && (
            <Link
              href={`/drops/${lockedDrop.slug}`}
              className="mb-4 inline-flex rounded-2xl bg-brand px-3 py-1.5 text-sm leading-snug text-ink"
            >
              Bagian dari {lockedDrop.code} · rilis {formatReleaseWIB(lockedDrop.releaseAt)}
            </Link>
          )}
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)]">{product.name}</h1>
          {product.colorway && <p className="mt-2 text-lg">{product.colorway}</p>}

          <p className="tabular mt-4 text-xl">
            {product.compareAtPrice && (
              <s className="mr-2 text-stone">{formatRupiah(product.compareAtPrice)}</s>
            )}
            {formatRupiah(product.price)}
          </p>

          {colorways.length > 1 && (
            <div className="mt-6">
              <p className="text-sm">Warna</p>
              <ul className="mt-3 flex gap-2">
                {colorways.map((c) => {
                  const hex = c.variants[0]?.colorHex ?? "#ccc";
                  const current = c.id === product.id;
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/products/${c.slug}`}
                        aria-label={c.colorway}
                        aria-current={current ? "page" : undefined}
                        className={`block size-9 rounded-full border ${current ? "ring-2 ring-ink ring-offset-2" : "border-line"}`}
                        style={{ backgroundColor: hex }}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <ProductPurchase
              product={product}
              lockedLabel={lockedDrop ? `Rilis ${formatReleaseShortWIB(lockedDrop.releaseAt)}` : undefined}
            />
          </div>

          <div className="mt-10 border-t border-line">
            <Detail title="Deskripsi" open>
              <p>{product.description}</p>
            </Detail>
            <Detail title="Bahan & perawatan">
              {product.material && <p>{product.material}</p>}
              <ul className="mt-2 list-disc pl-5">
                {product.careInstructions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Detail>
            {sizeGuide && (
              <Detail title="Panduan ukuran">
                <div className="overflow-x-auto">
                  <table className="tabular w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="py-2 pr-4 font-medium">Ukuran</th>
                        {sizeGuide.columns.map((c) => (
                          <th key={c} className="py-2 pr-4 font-medium">
                            {c} ({sizeGuide.unit})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeGuide.rows.map((r) => (
                        <tr key={r.size} className="border-b border-line last:border-0">
                          <td className="py-2 pr-4">{r.size}</td>
                          {r.values.map((v, i) => (
                            <td key={i} className="py-2 pr-4">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sizeGuide.note && <p className="mt-3 text-stone">{sizeGuide.note}</p>}
              </Detail>
            )}
            <Detail title="Pengiriman & retur">
              <p>Kebijakan pengiriman dan retur menyusul dari Fleece Hearts.</p>
            </Detail>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="pt-24">
          <h2 id="related-heading" className="font-display text-[clamp(2rem,4vw,3rem)]">
            Mungkin kamu suka
          </h2>
          <div className="mt-8">
            <ProductGrid products={related} lockedByProduct={lockedByProduct} priorityCount={0} />
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({ title, open, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-xl leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-5 text-sm leading-relaxed">{children}</div>
    </details>
  );
}
