# FLEECE HEARTS — Design Direction & Work Plan

**Client:** Oman (via Hammad Studio)
**Brand:** Fleece Hearts
**Domain target:** fleeceheart.com (available per 18 Okt 2026, belum dibeli; fleecehearts.com juga available)
**Dokumen induk:** `Fashion_Ecommerce_Business_Management_Platform_Master_Blueprint.md`
**Status:** Draft rencana, menunggu konfirmasi Hammad & data dari klien

> Dokumen ini **melengkapi** Master Blueprint, bukan menggantikan. Arsitektur, stack, dan rules di blueprint tetap berlaku.

---

## 1. Referensi dari Klien

| Brand | URL | Catatan |
|---|---|---|
| Preface | prefacewearhouse.com | Hero carousel full-width, rilis bernama "CH18 – AFTER CLASS", pengumuman jam rilis ("TONIGHT, 7PM WIB"), CTA "SHOP NOW", aksen merah tunggal |
| Calle de Larache | calledelarache.com | Sangat minimal: logo → 1 banner → "SHOP HERE". Charcoal (#363636) |
| Dust La Stella | dustlastella.com | Banner → grid produk → "View all" → promo + **countdown timer**. Nama produk format "Produk – Warna", harga Rp. Near-black (#0B0B0B) |

Klien: *"yang buat kayak penjualan gini"* + *"yang penting simple minimalis"*.

### Pola yang sama di ketiganya

1. **Drop-based selling** — produk dirilis per koleksi/chapter pada jam tertentu, bukan katalog yang selalu buka.
2. **Navigasi super minim** — logo, shop, cart, cek order. Tidak ada mega-menu.
3. **Foto yang bicara** — banner/foto campaign besar, teks sedikit.
4. **Satu warna brand** di atas netral (hitam/putih/abu).
5. **Cek order tanpa login** (`/orders`) — pembeli bisa lacak pesanan pakai nomor order + email/HP.
6. Brand lokal Indonesia, harga Rp, zona waktu WIB.

> Catatan: ketiganya tampaknya pakai platform hosted yang sama. Kita bikin custom (sesuai blueprint), tapi **UX dasarnya kita adopsi** karena itu yang klien kenal dan mau.

---

## 2. Design Direction

**Kata kunci:** minimal, editorial, bold, stylish, drop-culture streetwear.
**Prinsip:** *Foto yang utama, UI diam di belakang. Kuning cuma muncul di momen penting.*

### 2.1 Warna

| Token | Nilai | Pemakaian |
|---|---|---|
| `--brand` | `#FFC200` | CTA utama, badge "NEW DROP", countdown, highlight, focus state |
| `--ink` | `#0B0B0B` | Teks utama, header, footer, tombol sekunder |
| `--paper` | `#FFFFFF` / `#FAFAF7` | Background |
| `--muted` | `#6B6B6B` | Teks sekunder, harga coret |
| `--line` | `#E6E6E6` | Border, divider |
| `--danger` | TBD | Sold out / error (jangan pakai kuning) |

**Aturan kontras:** `#FFC200` **tidak boleh** dipakai sebagai warna teks di background putih (kontras ~1.6:1, gagal WCAG). Pakai sebagai **background** dengan teks `--ink` di atasnya (kontras ~12:1, aman).

### 2.2 Tipografi

- **Display / heading:** Coolvetica — judul drop, hero, nama koleksi. Uppercase, tracking rapat, ukuran besar.
- **Body / UI:** Helvetica Neue → fallback `"Helvetica Neue", Helvetica, Arial, sans-serif`.
- ⚠️ **Lisensi:** Helvetica adalah font komersial (butuh webfont license). Coolvetica juga perlu dicek lisensi web/komersialnya. Kalau klien belum punya lisensi, body pakai system stack di atas (tanpa embed file Helvetica), dan cari alternatif display yang free-for-commercial bila perlu.

### 2.3 Layout & Komponen

- Grid produk: 2 kolom mobile, 3–4 kolom desktop. Foto rasio 4:5, tanpa shadow, tanpa rounded besar.
- Product card: foto (hover → foto ke-2), nama "Produk – Warna", harga. Badge kecil: `NEW`, `SOLD OUT`, `LOW STOCK`.
- Tombol: kotak / radius kecil, uppercase, full-width di mobile.
- Header: logo tengah atau kiri, ikon cart + cek order. Menu hamburger di mobile.
- **Cart drawer** (slide dari kanan), bukan pindah halaman.
- Spacing lega, whitespace banyak, maksimal 1 aksen kuning per layar.

### 2.4 Motion

Halus & cepat (Framer Motion): fade/slide-up 200–300ms, transisi gambar crossfade, marquee teks untuk pengumuman drop. Tidak ada animasi berlebihan.

---

## 3. Penyesuaian terhadap Master Blueprint

Pola "drop" dari referensi menambah beberapa hal yang belum eksplisit di blueprint:

### 3.1 Modul baru: **Drops / Releases**

- Entity `drops`: nama (mis. "CH01 – …"), slug, deskripsi, banner, `release_at`, `end_at` (opsional), status (`UPCOMING` / `LIVE` / `SOLD_OUT` / `ENDED`), produk terkait.
- Halaman `/drops/[slug]` + section "Upcoming Drop" di homepage dengan **countdown**.
- Sebelum `release_at`: produk tampil, tombol **disabled** ("Available at 19:00 WIB"), opsi "Ingatkan saya" (later).
- Countdown dihitung dari **waktu server**, bukan jam device pembeli.
- Admin: CRUD drop, jadwal rilis, assign produk.

### 3.2 Guest checkout + cek order tanpa login

- Checkout tanpa akun (wajib nama, email, WA, alamat). Akun opsional.
- Halaman `/orders` → input nomor order + email/WA → tampil status & tracking.
- Customer dashboard (blueprint §9) tetap ada untuk yang daftar.

### 3.3 Stok & traffic saat drop (naik prioritas)

- **Stock reservation** (blueprint §42) dari "future" → **wajib di MVP backend**. Saat drop, banyak orang checkout bersamaan; tanpa reservasi pasti oversell.
- Reservasi dengan TTL (mis. 10–15 menit), auto-release kalau payment expired.
- Deduct stok pakai transaksi DB + row lock / atomic update.
- Rate limit checkout, cache katalog di jam drop, load test sebelum drop pertama.
- Opsi later: waiting room / queue kalau traffic sangat tinggi.

### 3.4 Navigasi disederhanakan

Storefront MVP cukup: **Home, Shop, Drops, Cek Order, Cart**, + footer (About, FAQ, Size Guide, Kebijakan, Kontak). Lookbook/Collections/Campaign tetap disiapkan tapi bukan prioritas awal.

---

## 4. Scope MVP vs Later

### MVP (yang ditunjukkan ke klien duluan)

**Storefront**
- Homepage: hero carousel, upcoming/live drop + countdown, grid produk, brand story singkat, Instagram/sosmed, footer
- Shop (filter sederhana: kategori, size, available)
- Drop page
- Product detail: galeri, pilih warna/size, stok, size guide, add to cart
- Cart drawer, checkout (guest), pilih kurir (mock), pilih metode bayar (mock), order success
- Cek order `/orders` + halaman tracking
- Halaman statis: About, FAQ, Size Guide, Shipping/Return Policy, Privacy, Terms, Contact

**Admin**
- Dashboard ringkas (order hari ini, revenue, low stock)
- Products + variants
- Inventory (stok per varian + movement history)
- Drops (jadwal rilis)
- Orders (list, detail, update status, input resi)
- CMS ringan: hero banner, announcement bar, section on/off

### Later (setelah MVP live)

Customer account lengkap, wishlist, chat realtime, promo/voucher, finance & reports lengkap, CMS section reorder penuh, lookbook, notifikasi WA/email, RBAC multi-role penuh, audit log UI.

> Struktur data & API tetap disiapkan untuk modul "later" sesuai blueprint, supaya tidak perlu rewrite.

---

## 5. Rencana Kerja

Estimasi kasar, asumsi 1 developer utama. Dikonfirmasi ulang setelah data klien lengkap.

### Tahap 0 — Setup & Discovery
- [ ] Konfirmasi domain (fleeceheart.com vs fleecehearts.com, saran: beli dua, satu redirect)
- [ ] Kumpulkan data klien (lihat §6)
- [ ] Cek lisensi font
- [ ] Scaffold monorepo: pnpm workspaces + Turborepo (`apps/web`, `apps/api`, `apps/worker`, `packages/types`, `packages/validation`, `packages/config`)
- [ ] Next.js 16 + Tailwind 4 + shadcn/ui di `apps/web`
- [ ] Design tokens Fleece Hearts (warna, font, spacing, radius)
- [ ] Mock data layer: adapter pattern (`MockCatalogService`, `MockOrderService`, `MockPaymentProvider`, `MockShippingProvider`) pakai types dari `packages/types`
- [ ] Deploy preview ke Vercel

### Tahap 1 — Storefront (MVP)
- [ ] Layout: header, announcement bar, footer, cart drawer
- [ ] Homepage + countdown drop
- [ ] Shop + filter
- [ ] Product detail + variant selector + size guide
- [ ] Drop page
- [ ] Halaman statis
- **Milestone:** demo storefront ke klien (pakai foto asli kalau sudah ada)

### Tahap 2 — Checkout Flow (mock)
- [ ] Cart (Zustand, persist)
- [ ] Checkout guest: form alamat (provinsi/kota/kecamatan), pilih kurir mock (JNE/J&T/SiCepat dll), pilih metode bayar mock (VA, QRIS, e-wallet)
- [ ] Simulasi status pembayaran (pending → paid / expired)
- [ ] Order success + cek order + tracking mock
- **Milestone:** klien bisa coba alur beli end-to-end

### Tahap 3 — Admin MVP (frontend + mock)
- [ ] Dashboard, Products/Variants, Inventory, Drops, Orders, CMS ringan
- **Milestone:** klien bisa coba kelola produk & order

### Tahap 4 — Backend Core (VPS)
- [ ] Fastify + Drizzle + PostgreSQL + Redis (Docker Compose)
- [ ] Auth admin + RBAC dasar
- [ ] Catalog, Inventory (ledger + **reservation**), Drops, Cart, Checkout, Orders
- [ ] Ganti mock adapter → API adapter di frontend
- [ ] Upload media ke Cloudflare R2

### Tahap 5 — Payment & Shipping Real
- [ ] Payment gateway (Midtrans / Xendit — tunggu keputusan) + webhook idempotent
- [ ] Shipping aggregator (Biteship / RajaOngkir — tunggu keputusan): ongkir, resi, tracking
- [ ] Invoice/receipt

### Tahap 6 — Hardening & Go-Live
- [ ] Load test skenario drop
- [ ] Security baseline (blueprint §37), backup (§38), monitoring (§39)
- [ ] UAT dengan klien
- [ ] Go-live + drop pertama

### Tahap 7 — Fase Lanjutan
Fitur "Later" di §4.

---

## 6. Data yang Masih Dibutuhkan dari Klien

**Sudah ada**
- [x] Nama brand: Fleece Hearts
- [x] Warna: #FFC200
- [x] Font: Helvetica / Coolvetica
- [x] Domain yang diinginkan: fleeceheart.com
- [x] Referensi website (§1)

**Belum ada — dibutuhkan untuk Tahap 1**
- [ ] Logo (SVG/PNG transparan, versi hitam & putih)
- [ ] Deskripsi singkat / tagline / about brand
- [ ] Foto produk (min. 3–4 per produk, background konsisten)
- [ ] Foto banner / campaign / model
- [ ] Daftar produk: nama, harga, deskripsi, bahan, care instruction
- [ ] Varian: size & warna per produk + stok awal
- [ ] Size chart
- [ ] Nama drop/koleksi pertama + jadwal rilis (kalau sudah ada)
- [ ] WhatsApp, Instagram/TikTok, email, lokasi

**Dibutuhkan nanti (Tahap 4–5)**
- [ ] Payment gateway & metode bayar
- [ ] Kurir & alamat pickup
- [ ] Rekening settlement
- [ ] Siapa saja admin/staff
- [ ] VPS, akses Cloudflare/DNS

> Sesuai blueprint: **jangan karang data klien.** Data yang belum ada diisi mock dengan label `[DUMMY]`.

---

## 7. Keputusan yang Perlu Dikonfirmasi

1. Domain utama: `fleeceheart.com` atau `fleecehearts.com`? (nama brand pakai "s")
2. Apakah klien memang jualan model **drop** (rilis terjadwal), atau katalog biasa yang selalu buka, atau campuran?
3. Guest checkout saja dulu, atau wajib akun?
4. Lisensi font Helvetica/Coolvetica sudah dimiliki?
5. Scope MVP di §4 disetujui?
