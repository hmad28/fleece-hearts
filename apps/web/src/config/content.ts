/**
 * ⚠️ COPY DUMMY untuk demo — BELUM dari klien.
 * Nanti dikelola dari CMS (blueprint §4). Konfirmasi/ganti sebelum go-live.
 */
export const homeCopy = {
  isDummy: true,
  hero: {
    eyebrow: "Drop pertama",
    body: "Polar fleece tebal berkerah tinggi, dalam Butter dan Black. Jumlahnya terbatas, tanpa restock.",
  },
  looks: [
    { image: "/images/dummy/look-hoodie-steps.jpg", alt: "Model memakai hoodie hitam dan sweatpants oat", title: "Everyday Hoodie", href: "/products/everyday-hoodie-black" },
    { image: "/images/dummy/look-rooftop.jpg", alt: "Dua model memakai crewneck hijau dan kaos putih", title: "Heart Crewneck & Monogram Tee", href: "/shop?category=crewneck" },
  ],
  detail: {
    title: "Tebal, tapi tetap adem.",
    body: "Polar fleece 320 gsm dari poliester daur ulang, anti-pilling, dengan resleting YKK. Dipotong boxy supaya pas dipakai di atas kaos.",
    specs: [
      { label: "Bahan", value: "Polar fleece 320 gsm" },
      { label: "Potongan", value: "Boxy, bahu turun" },
      { label: "Rilis", value: "Terbatas, tanpa restock" },
    ],
    image: "/images/dummy/detail-fleece.jpg",
    imageAlt: "Detail bahan polar fleece kuning dengan resleting hitam",
    href: "/products/polar-fleece-zip-butter",
  },
  newsletter: {
    title: "Kabari aku pas drop berikutnya.",
    body: "Satu email per rilis. Tanpa spam.",
  },
} as const;
