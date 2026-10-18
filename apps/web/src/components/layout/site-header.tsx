import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { mainNav } from "@/config/site";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur [--header-h:4rem]">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-1">
          <MobileMenu />
          <Link href="/" aria-label="Fleece Hearts, ke beranda" className="rounded-sm">
            <Wordmark />
          </Link>
        </div>
        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
