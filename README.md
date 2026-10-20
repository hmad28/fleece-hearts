# Fleece Hearts — Commerce Platform

Monorepo storefront + admin + backend untuk Fleece Hearts (klien: Oman, via Hammad Studio).

- Rencana & arah desain: `docs/Fleece_Hearts_Design_Direction_and_Work_Plan.md`
- Arsitektur induk: `docs/Fashion_Ecommerce_Business_Management_Platform_Master_Blueprint.md`

## Struktur

```text
apps/
  web/         Next.js 16 — storefront, customer portal, admin (deploy: Vercel)
  api/         Fastify backend (Tahap 4, belum dibuat — deploy: VPS)
  worker/      BullMQ worker (Tahap 4–6, belum dibuat)
packages/
  types/       Kontrak data domain (Product, Drop, Order, Payment, Shipping, ...)
  shared/      Helper domain murni (format rupiah, status stok, status drop, countdown)
  validation/  Schema Zod — dipakai form frontend & validasi backend
  config/      tsconfig preset
docs/
```

## Menjalankan

Butuh Node 22+ dan pnpm 10.

```bash
corepack enable            # atau: npm i -g pnpm@10
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web               # http://localhost:3000
```

Perintah lain:

```bash
pnpm typecheck             # cek tipe semua package
pnpm build                 # build semua
```

## Aturan penting

1. **UI tidak boleh import mock data langsung.** Selalu lewat `services` (`apps/web/src/services`).
   Sekarang `NEXT_PUBLIC_DATA_SOURCE=mock`; di Tahap 4 tinggal tambah adapter `api` tanpa ubah UI.
2. **Uang = integer rupiah.** Format pakai `formatRupiah` dari `@fh/shared`.
3. **Status drop dari jam server**, bukan jam device (`getDropStatus`, `DropCountdown`).
4. **Data dummy ditandai `isDummy: true`**. Nama, harga, spesifikasi, stok, foto AI,
   dan copy produk saat ini hanya untuk demo; isi asli menunggu klien (lihat dokumen rencana §6).
5. Order, payment, dan shipment status dipisah (blueprint §7).

## Aset yang menunggu klien

| Aset | Taruh di | Catatan |
|---|---|---|
| Logo | `apps/web/public/brand/logo-mark.svg` | ✅ Sudah divektorkan dari logo klien (`logo-source.jpg`) |
| Font Coolvetica | `apps/web/public/fonts/coolvetica-regular.woff2` | Konfirmasi lisensi web dulu |
| Foto produk/banner | sementara foto AI di `apps/web/public/images/dummy/`; nanti Cloudflare R2 | Ganti `url` di mock data dengan foto asli |
| Kontak & sosmed | `apps/web/src/config/site.ts` | Nilai `null` = belum ada |

## Alur demo pembelian

`/shop` mendukung pencarian, kategori, ukuran, stok, dan urutan harga. Pilih varian produk,
tambahkan ke keranjang, lalu buka `/checkout` untuk alamat, kurir, dan metode pembayaran.
Setelah pesanan dibuat, tekan **Simulasikan pembayaran berhasil**. Halaman konfirmasi akan
memperbarui perjalanan pengiriman dalam sekitar 25 detik. `/orders` dapat menemukan kembali
pesanan dengan nomor order dan email/WhatsApp yang dipakai saat checkout.

Pesanan dan pembayaran demo disimpan di `localStorage` browser yang sama. Tidak ada transaksi
nyata atau pengiriman data checkout ke backend. Gunakan data kontak contoh saat mencoba demo.
