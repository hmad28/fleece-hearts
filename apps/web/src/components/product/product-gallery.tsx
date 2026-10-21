"use client";

import type { ProductImage } from "@fh/types";
import { useRef, useState } from "react";
import { Media } from "@/components/ui/media";
import { cn } from "@/lib/utils";

/**
 * Mobile: geser horizontal dengan penanda halaman.
 * Desktop: thumbnail vertikal + foto utama besar.
 */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const list = images.length > 0 ? images : [{ id: "ph", url: null, alt: title, position: 0 }];
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden">
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          aria-label={`Foto ${title}`}
        >
          {list.map((img, i) => (
            <Media key={img.id} asset={img} priority={i === 0} sizes="100vw" className="aspect-[4/5] w-full shrink-0 snap-center" />
          ))}
        </div>
        {list.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {list.map((img, i) => (
              <span key={img.id} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/25")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-3 md:grid md:grid-cols-[4.5rem_minmax(0,1fr)] lg:grid-cols-[5.5rem_minmax(0,1fr)]">
        <ul className="flex flex-col gap-2" aria-label="Pilih foto">
          {list.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Foto ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={cn("block w-full overflow-hidden rounded-md ring-offset-2 ring-offset-paper transition", i === active ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100")}
              >
                <Media asset={{ url: img.url, alt: "" }} sizes="88px" className="aspect-[4/5] w-full" />
              </button>
            </li>
          ))}
        </ul>
        <Media
          key={list[active]?.id}
          asset={list[active] ?? list[0]!}
          priority
          sizes="(min-width: 1024px) 50vw, 60vw"
          className="aspect-[4/5] w-full animate-[fh-fade_.35s_ease-out]"
        />
      </div>
    </div>
  );
}
