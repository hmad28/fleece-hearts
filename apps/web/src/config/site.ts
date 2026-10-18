/**
 * Identitas toko. Nilai `null` = BELUM ADA dari klien — jangan dikarang.
 * Nanti dipindah ke System Settings (blueprint §17) dan diambil dari backend.
 */
export const siteConfig = {
  name: "Fleece Hearts",
  domain: "fleeceheart.com",
  /** Belum ada dari klien. */
  tagline: null as string | null,
  /** Belum ada dari klien. */
  description: null as string | null,
  contact: {
    whatsapp: null as string | null,
    email: null as string | null,
    location: null as string | null,
  },
  social: {
    instagram: null as string | null,
    tiktok: null as string | null,
  },
  currency: "IDR",
  timezone: "Asia/Jakarta",
} as const;

export const mainNav = [
  { href: "/shop", label: "Shop" },
  { href: "/drops", label: "Drops" },
  { href: "/orders", label: "Cek order" },
] as const;

export const footerNav = [
  { href: "/about", label: "Tentang kami" },
  { href: "/faq", label: "FAQ" },
  { href: "/size-guide", label: "Panduan ukuran" },
  { href: "/shipping-policy", label: "Pengiriman" },
  { href: "/return-policy", label: "Retur & refund" },
  { href: "/privacy", label: "Privasi" },
  { href: "/terms", label: "Syarat & ketentuan" },
  { href: "/contact", label: "Kontak" },
] as const;
