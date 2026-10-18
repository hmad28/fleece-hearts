/**
 * ⚠️ DATA CONTOH — BUKAN DATA KLIEN.
 * Semua nama, harga, deskripsi, dan stok di sini dummy (isDummy: true).
 * Ganti dengan data asli Fleece Hearts saat sudah dikirim klien.
 */
import type { Category, Collection, Product, ProductVariant, SizeGuide } from "@fh/types";

export const categories: Category[] = [
  { id: "cat_hoodie", name: "Hoodie", slug: "hoodie", isDummy: true },
  { id: "cat_crewneck", name: "Crewneck", slug: "crewneck", isDummy: true },
  { id: "cat_tee", name: "T-shirt", slug: "t-shirt", isDummy: true },
  { id: "cat_pants", name: "Pants", slug: "pants", isDummy: true },
  { id: "cat_acc", name: "Aksesoris", slug: "aksesoris", isDummy: true },
];

export const collections: Collection[] = [
  { id: "col_core", name: "Core", slug: "core", description: "Koleksi contoh.", isDummy: true },
];

export const sizeGuides: SizeGuide[] = [
  {
    id: "sg_top",
    name: "Atasan (contoh)",
    unit: "cm",
    columns: ["Lebar dada", "Panjang badan"],
    rows: [
      { size: "S", values: [52, 68] },
      { size: "M", values: [55, 71] },
      { size: "L", values: [58, 74] },
      { size: "XL", values: [61, 77] },
    ],
    note: "Ukuran contoh. Tunggu size chart asli dari klien.",
    isDummy: true,
  },
];

const SIZES = ["S", "M", "L", "XL"] as const;

function variants(
  productId: string,
  skuBase: string,
  color: string,
  colorHex: string,
  stock: readonly number[],
  sizes: readonly string[] = SIZES,
): ProductVariant[] {
  return sizes.map((size, i) => ({
    id: `${productId}_${size.toLowerCase()}`,
    productId,
    sku: `${skuBase}-${size}`,
    size,
    color,
    colorHex,
    available: stock[i] ?? 0,
    status: "ACTIVE",
  }));
}

function images(productId: string, name: string, count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${productId}_img${i + 1}`,
    url: null, // foto asli belum ada
    alt: `${name} — foto ${i + 1}`,
    position: i,
  }));
}

type Seed = {
  id: string;
  slug: string;
  name: string;
  colorway: string;
  colorHex: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  stock: readonly number[];
  sizes?: readonly string[];
  dropId?: string;
  featured?: boolean;
  weightGram: number;
  createdAt: string;
};

const seeds: Seed[] = [
  { id: "p_001", slug: "contoh-hoodie-hitam", name: "Contoh Hoodie", colorway: "Hitam", colorHex: "#121212", price: 389000, categoryId: "cat_hoodie", stock: [4, 10, 8, 2], featured: true, weightGram: 650, createdAt: "2026-10-01T03:00:00.000Z" },
  { id: "p_002", slug: "contoh-hoodie-abu", name: "Contoh Hoodie", colorway: "Abu", colorHex: "#9A9A96", price: 389000, categoryId: "cat_hoodie", stock: [0, 3, 1, 0], weightGram: 650, createdAt: "2026-10-01T03:00:00.000Z" },
  { id: "p_003", slug: "contoh-crewneck-krem", name: "Contoh Crewneck", colorway: "Krem", colorHex: "#E9E1CF", price: 329000, compareAtPrice: 379000, categoryId: "cat_crewneck", stock: [6, 6, 6, 6], featured: true, weightGram: 520, createdAt: "2026-10-05T03:00:00.000Z" },
  { id: "p_004", slug: "contoh-tee-putih", name: "Contoh Tee", colorway: "Putih", colorHex: "#FFFFFF", price: 179000, categoryId: "cat_tee", stock: [12, 20, 15, 9], weightGram: 220, createdAt: "2026-10-08T03:00:00.000Z" },
  { id: "p_005", slug: "contoh-tee-kuning", name: "Contoh Tee", colorway: "Kuning", colorHex: "#FFC200", price: 179000, categoryId: "cat_tee", stock: [0, 0, 0, 0], weightGram: 220, createdAt: "2026-10-08T03:00:00.000Z" },
  { id: "p_006", slug: "contoh-sweatpants-hitam", name: "Contoh Sweatpants", colorway: "Hitam", colorHex: "#121212", price: 299000, categoryId: "cat_pants", stock: [5, 7, 7, 3], weightGram: 480, createdAt: "2026-10-10T03:00:00.000Z" },
  { id: "p_007", slug: "contoh-fleece-zip-kuning", name: "Contoh Fleece Zip", colorway: "Kuning", colorHex: "#FFC200", price: 459000, categoryId: "cat_hoodie", stock: [5, 8, 8, 4], dropId: "drop_ch01", featured: true, weightGram: 700, createdAt: "2026-10-15T03:00:00.000Z" },
  { id: "p_008", slug: "contoh-fleece-zip-hitam", name: "Contoh Fleece Zip", colorway: "Hitam", colorHex: "#121212", price: 459000, categoryId: "cat_hoodie", stock: [5, 8, 8, 4], dropId: "drop_ch01", weightGram: 700, createdAt: "2026-10-15T03:00:00.000Z" },
  { id: "p_009", slug: "contoh-cap-hitam", name: "Contoh Cap", colorway: "Hitam", colorHex: "#121212", price: 149000, categoryId: "cat_acc", stock: [20], sizes: ["All size"], dropId: "drop_ch01", weightGram: 150, createdAt: "2026-10-15T03:00:00.000Z" },
];

export const products: Product[] = seeds.map((s) => {
  const fullName = `${s.name} – ${s.colorway}`;
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    colorway: s.colorway,
    description: "Deskripsi contoh. Menunggu deskripsi produk asli dari klien.",
    material: "Bahan contoh",
    careInstructions: ["Instruksi perawatan contoh"],
    price: s.price,
    compareAtPrice: s.compareAtPrice,
    categoryId: s.categoryId,
    collectionIds: ["col_core"],
    dropId: s.dropId,
    images: images(s.id, fullName),
    variants: variants(s.id, s.id.toUpperCase().replace("_", ""), s.colorway, s.colorHex, s.stock, s.sizes),
    weightGram: s.weightGram,
    status: "ACTIVE",
    isFeatured: Boolean(s.featured),
    sizeGuideId: s.categoryId === "cat_acc" ? undefined : "sg_top",
    createdAt: s.createdAt,
    isDummy: true,
  };
});
