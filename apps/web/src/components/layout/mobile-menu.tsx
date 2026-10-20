"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { mainNav } from "@/config/site";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-full hover:bg-mist"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Tutup menu" : "Buka menu"}
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open && createPortal(
        <nav id="mobile-nav" aria-label="Navigasi mobile" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-paper px-5 pt-9 pb-12 sm:px-8">
          <p className="mb-5 text-xs font-semibold tracking-[0.16em] text-stone uppercase">Menu</p>
          <ul className="border-t border-line">
            {mainNav.map((item, index) => (
              <li key={item.href} className="border-b border-line">
                <Link href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between gap-4 py-5">
                  <span className="font-display text-[clamp(2.5rem,11vw,4rem)] leading-none">{item.label}</span>
                  <span className="text-xs text-stone tabular">0{index + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/account" onClick={() => setOpen(false)} className="mt-9 inline-flex min-h-12 items-center border-b border-ink text-sm font-medium">
            Akun saya <span className="ml-8" aria-hidden>↗</span>
          </Link>
        </nav>,
        document.body,
      )}
    </div>
  );
}
