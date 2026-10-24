"use client";

import { formatRupiah } from "@fh/shared";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Media } from "@/components/ui/media";
import { services } from "@/services";

const SUGGESTIONS = ["hoodie", "polar fleece", "kaos hitam", "sweatpants", "topi"];

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Shortcut "/" untuk buka pencarian.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(t.tagName)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-full hover:bg-mist"
        aria-label="Cari produk"
      >
        <Search className="size-5" strokeWidth={1.75} aria-hidden />
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        aria-label="Pencarian"
        className="m-0 mt-0 w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40"
      >
        {open && <SearchPanel onClose={() => setOpen(false)} />}
      </dialog>
    </>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 180);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isFetching } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => services.catalog.listProducts({ search: debounced, perPage: 6 }),
    enabled: debounced.length > 1,
  });

  const go = (term: string) => {
    onClose();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="bg-paper px-4 pt-4 pb-8 shadow-xl md:px-10 lg:px-14">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) go(q.trim());
        }}
        className="flex items-center gap-3 border-b border-ink pb-3"
      >
        <Search className="size-6 shrink-0" aria-hidden />
        <label htmlFor="site-search" className="sr-only">
          Cari produk
        </label>
        <input
          id="site-search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari hoodie, polar fleece, kaos…"
          autoComplete="off"
          className="h-14 min-w-0 flex-1 bg-transparent text-[1.35rem] outline-none placeholder:text-stone/70 md:text-[1.6rem]"
        />
        <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-full hover:bg-mist" aria-label="Tutup pencarian">
          <X className="size-5" aria-hidden />
        </button>
      </form>

      {debounced.length < 2 ? (
        <div className="pt-6">
          <p className="text-sm text-stone">Pencarian populer</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => go(s)} className="h-9 rounded-full border border-line px-4 text-sm hover:border-ink">
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="pt-6" aria-live="polite">
          {isFetching && !data ? (
            <p className="text-sm text-stone">Mencari…</p>
          ) : data && data.items.length > 0 ? (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {data.items.map((p) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.slug}`} onClick={onClose} className="group block">
                      <Media asset={p.images[0] ?? { url: null, alt: p.name }} sizes="200px" className="aspect-[4/5] w-full" />
                      <p className="mt-2 text-sm group-hover:underline">{p.name}</p>
                      <p className="text-sm text-stone">
                        {p.colorway} · {formatRupiah(p.price)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => go(debounced)} className="mt-6 text-sm underline underline-offset-4">
                Lihat semua hasil untuk “{debounced}” ({data.total})
              </button>
            </>
          ) : (
            <p className="text-lg">
              Tidak ada produk untuk “{debounced}”. Coba kata lain, misalnya <button type="button" className="underline" onClick={() => go("hoodie")}>hoodie</button>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
