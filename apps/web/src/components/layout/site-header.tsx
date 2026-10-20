import Link from "next/link";
import { UserRound } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { mainNav } from "@/config/site";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-md [--header-h:4rem]">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-5 md:px-10 lg:px-14">
        <div className="flex items-center">
          <MobileMenu />
          <Link href="/" aria-label="Fleece Hearts, ke beranda" className="hidden rounded-sm md:block">
            <Wordmark />
          </Link>
        </div>
        <Link href="/" aria-label="Fleece Hearts, ke beranda" className="min-w-0 rounded-sm md:hidden">
          <Wordmark className="gap-1.5 whitespace-nowrap sm:gap-2.5" />
        </Link>
        <nav aria-label="Navigasi utama" className="hidden md:col-start-2 md:row-start-1 md:block">
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
        <div className="flex items-center justify-end gap-0 sm:gap-2 md:col-start-3 md:row-start-1 md:gap-4">
          <Link href="/account" aria-label="Akun" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-mist md:size-auto md:rounded-sm md:text-sm md:underline-offset-4 md:hover:bg-transparent md:hover:underline">
            <UserRound className="size-5 md:hidden" strokeWidth={1.75} aria-hidden />
            <span className="hidden md:inline">Akun</span>
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
