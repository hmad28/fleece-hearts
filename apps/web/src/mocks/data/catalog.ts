/**
 * ⚠️ DATA DUMMY — BUKAN DATA KLIEN.
 * Nama, harga, deskripsi, bahan, stok, dan gambar di sini dibuat untuk demo (isDummy: true).
 * Gambar = foto hasil AI generate (public/images/dummy), bukan foto produk asli.
 * Ganti dengan data asli Fleece Hearts saat sudah dikirim klien.
 */
import type { Category, Collection, Product, ProductVariant, SizeGuide } from "@fh/types";

export const categories: Category[] = [
  { id: "cat_hoodie", name: "Hoodie & Zip", slug: "hoodie", isDummy: true },
  { id: "cat_crewneck", name: "Crewneck", slug: "crewneck", isDummy: true },
  { id: "cat_tee", name: "T-shirt", slug: "t-shirt", isDummy: true },
  { id: "cat_pants", name: "Pants", slug: "pants", isDummy: true },
  { id: "cat_head", name: "Headwear", slug: "headwear", isDummy: true },
  { id: "cat_bag", name: "Bags", slug: "bags", isDummy: true },
];

export const collections: Collection[] = [
  { id: "col_core", name: "Core", slug: "core", description: "Basic harian yang selalu tersedia.", isDummy: true },
  { id: "col_ch01", name: "CH01 Warm Up", slug: "ch01-warm-up", description: "Rilis pertama: polar fleece.", isDummy: true },
];

export const sizeGuides: SizeGuide[] = [
  {
    id: "sg_top",
    name: "Hoodie, zip & crewneck",
    unit: "cm",
    columns: ["Lebar dada", "Panjang badan", "Panjang lengan"],
    rows: [
      { size: "S", values: [56, 66, 58] },
      { size: "M", values: [59, 69, 60] },
      { size: "L", values: [62, 72, 62] },
      { size: "XL", values: [65, 75, 64] },
    ],
    note: "Potongan boxy. Kalau ragu di antara dua ukuran, ambil yang lebih kecil.",
    isDummy: true,
  },
  {
    id: "sg_tee",
    name: "T-shirt",
    unit: "cm",
    columns: ["Lebar dada", "Panjang badan"],
    rows: [
      { size: "S", values: [52, 68] },
      { size: "M", values: [55, 71] },
      { size: "L", values: [58, 74] },
      { size: "XL", values: [61, 77] },
    ],
    note: "Diukur dalam posisi kaos rata di meja.",
    isDummy: true,
  },
  {
    id: "sg_pants",
    name: "Pants",
    unit: "cm",
    columns: ["Lingkar pinggang (karet)", "Panjang", "Lebar paha"],
    rows: [
      { size: "S", values: ["66–84", 98, 31] },
      { size: "M", values: ["70–88", 100, 32] },
      { size: "L", values: ["74–92", 102, 33] },
      { size: "XL", values: ["78–96", 104, 34] },
    ],
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
    id: `${productId}_${size.toLowerCase().replace(/\s+/g, "")}`,
    productId,
    sku: `${skuBase}-${size.replace(/\s+/g, "").toUpperCase()}`,
    size,
    color,
    colorHex,
    available: stock[i] ?? 0,
    status: "ACTIVE",
  }));
}

/**
 * Foto dummy hasil AI (public/images/dummy). Foto pertama = packshot, sisanya foto lookbook.
 * ⚠️ Bukan foto produk asli — ganti saat foto Fleece Hearts sudah ada.
 */
const LOOKS: Record<string, { file: string; alt: string }> = {
  steps: { file: "look-hoodie-steps", alt: "Model memakai hoodie hitam dan sweatpants oat di tangga" },
  rooftop: { file: "look-rooftop", alt: "Dua model memakai crewneck hijau dan kaos putih di rooftop" },
  heroModel: { file: "hero-model", alt: "Model memakai polar fleece kuning di depan dinding pasir" },
  detailFleece: { file: "detail-fleece", alt: "Detail bahan polar fleece kuning dan resleting hitam" },
  campaign: { file: "campaign-wide", alt: "Dua model memakai polar fleece hitam dan kuning" },
};

function images(slug: string, name: string, looks: (keyof typeof LOOKS)[] = []) {
  const packshot = { file: slug, alt: `${name}, tampak depan` };
  return [packshot, ...looks.map((k) => LOOKS[k]!)].map((img, i) => ({
    id: `${slug}_img${i + 1}`,
    url: `/images/dummy/${img.file}.jpg`,
    alt: img.alt,
    position: i,
  }));
}

type Seed = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  colorway: string;
  colorHex: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  collectionIds?: string[];
  description: string;
  material: string;
  care?: string[];
  stock: readonly number[];
  sizes?: readonly string[];
  sizeGuideId?: string;
  dropId?: string;
  featured?: boolean;
  looks?: (keyof typeof LOOKS)[];
  weightGram: number;
  createdAt: string;
};

const CARE_FLEECE = [
  "Cuci dengan air dingin, bagian dalam di luar",
  "Jangan pakai pemutih",
  "Jemur di tempat teduh, jangan diperas kuat",
  "Setrika suhu rendah, hindari area sablon",
];
const CARE_TEE = ["Cuci dengan air dingin", "Jangan pakai pemutih", "Setrika bagian dalam, suhu sedang"];

const seeds: Seed[] = [
  {
    id: "p_001", slug: "everyday-hoodie-black", sku: "FH-HD01-BLK", looks: ["steps"], name: "Everyday Hoodie", colorway: "Black", colorHex: "#1C1C1C",
    price: 389000, categoryId: "cat_hoodie", sizeGuideId: "sg_top", featured: true, weightGram: 680, createdAt: "2026-09-20T03:00:00.000Z",
    description: "Hoodie harian dengan potongan boxy dan bahu turun. Hood dua lapis, saku kanguru, dan rib tebal di manset serta bawah.",
    material: "Cotton fleece 330 gsm (80% katun, 20% poliester), bagian dalam brushed lembut.",
    stock: [6, 14, 11, 4],
  },
  {
    id: "p_002", slug: "everyday-hoodie-oat", sku: "FH-HD01-OAT", name: "Everyday Hoodie", colorway: "Oat", colorHex: "#E9DFCC",
    price: 389000, categoryId: "cat_hoodie", sizeGuideId: "sg_top", weightGram: 680, createdAt: "2026-09-20T03:00:00.000Z",
    description: "Hoodie harian dengan potongan boxy dan bahu turun. Hood dua lapis, saku kanguru, dan rib tebal di manset serta bawah.",
    material: "Cotton fleece 330 gsm (80% katun, 20% poliester), bagian dalam brushed lembut.",
    stock: [0, 3, 2, 1],
  },
  {
    id: "p_003", slug: "heart-crewneck-forest", sku: "FH-CR01-FOR", looks: ["rooftop"], name: "Heart Crewneck", colorway: "Forest", colorHex: "#34493B",
    price: 299000, compareAtPrice: 349000, categoryId: "cat_crewneck", sizeGuideId: "sg_top", featured: true, weightGram: 560, createdAt: "2026-09-28T03:00:00.000Z",
    description: "Crewneck polos dengan rib tebal di leher, manset, dan bawah supaya bentuknya tetap rapi setelah dicuci.",
    material: "Cotton fleece 300 gsm (80% katun, 20% poliester).",
    stock: [5, 9, 9, 6],
  },
  {
    id: "p_004", slug: "monogram-tee-white", sku: "FH-TS01-WHT", looks: ["rooftop"], name: "Monogram Tee", colorway: "White", colorHex: "#FBFAF6",
    price: 179000, categoryId: "cat_tee", sizeGuideId: "sg_tee", weightGram: 230, createdAt: "2026-10-02T03:00:00.000Z",
    description: "Kaos heavyweight dengan leher rib rapat dan bahu turun. Tidak menerawang, tidak melar.",
    material: "Katun combed 24s, 220 gsm.", care: CARE_TEE,
    stock: [18, 25, 20, 12],
  },
  {
    id: "p_005", slug: "monogram-tee-black", sku: "FH-TS01-BLK", name: "Monogram Tee", colorway: "Black", colorHex: "#181818",
    price: 179000, categoryId: "cat_tee", sizeGuideId: "sg_tee", weightGram: 230, createdAt: "2026-10-02T03:00:00.000Z",
    description: "Kaos heavyweight dengan leher rib rapat dan bahu turun. Tidak menerawang, tidak melar.",
    material: "Katun combed 24s, 220 gsm.", care: CARE_TEE,
    stock: [10, 16, 14, 2],
  },
  {
    id: "p_006", slug: "polar-fleece-zip-butter", sku: "FH-ZP01-BTR", looks: ["heroModel", "detailFleece"], name: "Polar Fleece Zip", colorway: "Butter", colorHex: "#F2CC45",
    price: 459000, categoryId: "cat_hoodie", collectionIds: ["col_ch01"], sizeGuideId: "sg_top", dropId: "drop_ch01", featured: true, weightGram: 720, createdAt: "2026-10-15T03:00:00.000Z",
    description: "Jaket polar fleece dengan kerah berdiri dan resleting penuh. Saku dada beresleting dan dua saku samping.",
    material: "Polar fleece anti-pilling 320 gsm (100% poliester daur ulang).",
    stock: [8, 12, 12, 6],
  },
  {
    id: "p_007", slug: "polar-fleece-zip-black", sku: "FH-ZP01-BLK", looks: ["campaign"], name: "Polar Fleece Zip", colorway: "Black", colorHex: "#1C1C1C",
    price: 459000, categoryId: "cat_hoodie", collectionIds: ["col_ch01"], sizeGuideId: "sg_top", dropId: "drop_ch01", weightGram: 720, createdAt: "2026-10-15T03:00:00.000Z",
    description: "Jaket polar fleece dengan kerah berdiri dan resleting penuh. Saku dada beresleting dan tarikan resleting kuning.",
    material: "Polar fleece anti-pilling 320 gsm (100% poliester daur ulang).",
    stock: [8, 12, 12, 6],
  },
  {
    id: "p_008", slug: "lounge-sweatpants-charcoal", sku: "FH-PT01-CHR", name: "Lounge Sweatpants", colorway: "Charcoal", colorHex: "#3B3B3E",
    price: 319000, categoryId: "cat_pants", sizeGuideId: "sg_pants", featured: true, weightGram: 520, createdAt: "2026-09-25T03:00:00.000Z",
    description: "Celana jogger dengan potongan lurus, pinggang karet dan tali serut. Dua saku samping dan satu saku belakang.",
    material: "Cotton fleece 300 gsm (80% katun, 20% poliester).",
    stock: [7, 10, 8, 3],
  },
  {
    id: "p_009", slug: "lounge-sweatpants-oat", sku: "FH-PT01-OAT", looks: ["steps"], name: "Lounge Sweatpants", colorway: "Oat", colorHex: "#E9DFCC",
    price: 319000, categoryId: "cat_pants", sizeGuideId: "sg_pants", weightGram: 520, createdAt: "2026-09-25T03:00:00.000Z",
    description: "Celana jogger dengan potongan lurus, pinggang karet dan tali serut. Dua saku samping dan satu saku belakang.",
    material: "Cotton fleece 300 gsm (80% katun, 20% poliester).",
    stock: [4, 6, 5, 2],
  },
  {
    id: "p_010", slug: "mark-cap-black", sku: "FH-CP01-BLK", looks: ["campaign"], name: "Mark Cap", colorway: "Black", colorHex: "#161616",
    price: 149000, categoryId: "cat_head", collectionIds: ["col_ch01"], dropId: "drop_ch01", weightGram: 120, createdAt: "2026-10-15T03:00:00.000Z",
    description: "Topi 6 panel dengan visor melengkung. Strap di belakang bisa diatur.",
    material: "Katun twill 100%.", care: ["Cuci tangan dengan air dingin", "Jangan dimasukkan mesin pengering"],
    stock: [30], sizes: ["All size"],
  },
  {
    id: "p_011", slug: "rib-beanie-butter", sku: "FH-BN01-BTR", name: "Rib Beanie", colorway: "Butter", colorHex: "#F2CC45",
    price: 129000, categoryId: "cat_head", weightGram: 90, createdAt: "2026-09-18T03:00:00.000Z",
    description: "Beanie rajut rib dengan lipatan lebar. Lembut dan tidak gatal.",
    material: "Akrilik lembut 100%.", care: ["Cuci tangan dengan air dingin", "Keringkan mendatar"],
    stock: [0], sizes: ["All size"],
  },
  {
    id: "p_012", slug: "canvas-tote-natural", sku: "FH-TB01-NAT", name: "Canvas Tote", colorway: "Natural", colorHex: "#EDE3D0",
    price: 119000, categoryId: "cat_bag", weightGram: 260, createdAt: "2026-09-10T03:00:00.000Z",
    description: "Tote kanvas tebal yang muat laptop 14 inci, dengan tali panjang untuk dipakai di bahu.",
    material: "Kanvas katun 12 oz.", care: ["Cuci tangan dengan air dingin", "Jangan diperas"],
    stock: [22], sizes: ["One size"],
  },
];

export const products: Product[] = seeds.map((s) => {
  const fullName = `${s.name} – ${s.colorway}`;
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    colorway: s.colorway,
    description: s.description,
    material: s.material,
    careInstructions: s.care ?? CARE_FLEECE,
    price: s.price,
    compareAtPrice: s.compareAtPrice,
    categoryId: s.categoryId,
    collectionIds: s.collectionIds ?? ["col_core"],
    dropId: s.dropId,
    images: images(s.slug, fullName, s.looks),
    variants: variants(s.id, s.sku, s.colorway, s.colorHex, s.stock, s.sizes),
    weightGram: s.weightGram,
    status: "ACTIVE",
    isFeatured: Boolean(s.featured),
    sizeGuideId: s.sizeGuideId,
    createdAt: s.createdAt,
    isDummy: true,
  };
});
