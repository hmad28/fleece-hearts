import { connection } from "next/server";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StorefrontChrome } from "@/components/layout/storefront-chrome";
import { PromotionPopup } from "@/components/layout/promotion-popup";
import { formatReleaseWIB } from "@/lib/datetime";
import { getDropContext } from "@/lib/drop-context";
import { getSiteContent } from "@/lib/site-content";

const isMock = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  await connection();
  const [{ featured: next }, content] = await Promise.all([getDropContext(), getSiteContent()]);
  const announcement = content.announcement || (next
    ? next.status === "LIVE"
      ? `${next.code} sudah rilis. Belanja sekarang.`
      : `${next.code} rilis ${formatReleaseWIB(next.releaseAt)}`
    : null);

  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Langsung ke konten
      </a>
      <StorefrontChrome>
        {announcement && <AnnouncementBar text={announcement} href={next ? `/drops/${next.slug}` : undefined} />}
        <SiteHeader />
      </StorefrontChrome>
      <main id="konten">{children}</main>
      <StorefrontChrome>
        <SiteFooter content={content} />
        <CartDrawer />
        <PromotionPopup imageUrl={content.promotionEnabled ? content.promotionImageUrl : null} />
        {isMock && (
        <p className="bg-mist px-4 py-2 text-center text-xs text-stone">
          Mode demo: produk, harga, stok, pembayaran, dan pengiriman masih data contoh.
        </p>
        )}
      </StorefrontChrome>
    </>
  );
}
