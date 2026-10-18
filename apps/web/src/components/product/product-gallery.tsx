import type { ProductImage } from "@fh/types";
import { Media } from "@/components/ui/media";

/**
 * Mobile: geser horizontal (scroll-snap). Desktop: foto ditumpuk vertikal ala editorial.
 */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const list = images.length > 0 ? images : [{ id: "ph", url: null, alt: title, position: 0 }];
  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto md:mx-0 md:grid md:grid-cols-1 md:gap-3 md:overflow-visible"
      aria-label={`Foto ${title}`}
    >
      {list.map((img, i) => (
        <Media
          key={img.id}
          asset={img}
          priority={i === 0}
          sizes="(min-width: 768px) 55vw, 90vw"
          placeholderLabel={`Foto ${i + 1} menyusul`}
          className="aspect-[4/5] w-[88%] shrink-0 snap-center first:ml-4 last:mr-4 md:w-full md:first:ml-0 md:last:mr-0"
        />
      ))}
    </div>
  );
}
