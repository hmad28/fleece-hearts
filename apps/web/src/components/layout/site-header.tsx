import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { mainNav } from "@/config/site";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md [--header-h:4rem]">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10 lg:px-14">
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
        <div className="flex items-center justify-end gap-4">
          <Link href="/account" className="text-sm underline-offset-4 hover:underline">Akun</Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
