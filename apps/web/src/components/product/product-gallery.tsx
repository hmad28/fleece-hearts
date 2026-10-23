"use client";

import type { ProductImage } from "@fh/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Media } from "@/components/ui/media";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const list = images.length > 0 ? images : [{ id: "ph", url: null, alt: title, position: 0 }];
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  function goTo(index: number) {
    const target = Math.max(0, Math.min(index, list.length - 1));
    scroller.current?.scrollTo({ left: target * scroller.current.clientWidth, behavior: "smooth" });
    setActive(target);
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-mist md:rounded-3xl">
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.clientWidth) setActive(Math.min(list.length - 1, Math.round(el.scrollLeft / el.clientWidth)));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`Foto ${title}`}
        >
          {list.map((img, i) => (
            <div key={img.id} className="w-full shrink-0 snap-center">
              <Media asset={img} priority={i === 0} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/5] w-full" />
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Foto sebelumnya" className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/95 shadow-sm disabled:opacity-40 md:flex"><ChevronLeft className="size-5" aria-hidden /></button>
            <button type="button" onClick={() => goTo(active + 1)} disabled={active === list.length - 1} aria-label="Foto berikutnya" className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/95 shadow-sm disabled:opacity-40 md:flex"><ChevronRight className="size-5" aria-hidden /></button>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2" aria-label="Pilih foto produk">
          {list.map((img, i) => (
            <button key={img.id} type="button" onClick={() => goTo(i)} aria-label={`Lihat foto ${i + 1} dari ${list.length}`} aria-current={i === active ? "true" : undefined} className="flex size-7 items-center justify-center rounded-full">
              <span className={cn("block size-2 rounded-full transition-all", i === active ? "scale-125 bg-brand" : "bg-ink/25 hover:bg-ink/60")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
