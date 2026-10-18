import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Checkout" };

/** Placeholder — alur checkout lengkap dikerjakan di Tahap 2. */
export default function CheckoutPage() {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-[90rem] flex-col items-start justify-center px-4 md:px-8">
      <h1 className="font-display text-[clamp(3rem,10vw,7rem)]">Checkout</h1>
      <p className="mt-4 max-w-md text-lg">Halaman checkout sedang dibangun. Isi keranjangmu tetap tersimpan.</p>
      <ButtonLink href="/shop" variant="outline" className="mt-8">
        Kembali ke shop
      </ButtonLink>
    </div>
  );
}
