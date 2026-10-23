# Fleece Hearts — Commerce Platform

Monorepo storefront + admin + backend untuk Fleece Hearts (klien: Oman, via Hammad Studio).

- Rencana & arah desain: `docs/Fleece_Hearts_Design_Direction_and_Work_Plan.md`
- Arsitektur induk: `docs/Fashion_Ecommerce_Business_Management_Platform_Master_Blueprint.md`

## Struktur

```text
apps/
  web/         Next.js 16 — storefront, customer portal, admin (deploy: Vercel)
  api/         Rencana Fastify backend untuk transaksi nyata
  worker/      Rencana worker untuk pekerjaan latar
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

## Neon Postgres dan Auth

Proyek Neon ditautkan lewat `.neon` (diabaikan Git); layanan yang dideklarasikan di
`neon.ts` adalah Postgres dan Neon Auth. Setelah `neon login`, jalankan `neon deploy`
di root untuk menyinkronkan konfigurasi dan menarik variabel Neon ke `.env.local` root.
Simpan `NEON_AUTH_COOKIE_SECRET` (string acak minimal 32 karakter) di file itu juga.
Script `dev` dan `build` web menyalin variabel root ke `apps/web/.env.local` tanpa
menghapus kunci lokal lain. Keduanya diabaikan Git.

Jalankan semua migrasi dan seed katalog awal dengan koneksi langsung (`DATABASE_URL_UNPOOLED`):

```bash
node --env-file=.env.local apps/web/scripts/migrate.mjs
node --env-file=.env.local --import tsx apps/web/scripts/seed.ts
```

`/auth` menyediakan daftar/masuk. `/account` menyimpan alamat, menampilkan riwayat
pesanan demo, dan menyediakan chat dua arah dengan admin. Saat masuk, checkout otomatis
mengisi data akun dan alamat. Katalog, stok, drop, konten beranda, dan chat tersimpan di
Neon Postgres. Checkout tamu dan pembayaran demo masih memakai browser; pesanan yang
dibuat saat masuk juga disalin ke Postgres untuk dashboard customer dan admin.

`/admin` berisi ringkasan, produk, mutasi stok, drop, pesanan demo, CMS beranda,
inbox chat, dan manajemen staf. Email owner awal `fleecehearts@gmail.com` tersimpan
di tabel `admin_staff`. Masuk melalui `/auth` dengan akun Google beremail tersebut;
akun yang terverifikasi akan ditautkan otomatis dan diarahkan dari `/account` ke
`/admin`. Owner dapat menambah owner/admin baru atau mencabut akses lama lewat
`/admin/staff`. Staf baru harus punya akun Neon Auth dengan email terverifikasi.
`ADMIN_USER_IDS` tetap tersedia untuk allowlist server berdasarkan ID akun yang sudah
ada, bila diperlukan. ID akun dapat dilihat di Neon SQL Editor:

```sql
SELECT id FROM neon_auth."user" WHERE email = 'email-staf@example.com';
```

Foto produk dan banner drop dapat diunggah dari dashboard melalui UploadThing.
Unggahan dibatasi untuk admin, satu gambar maksimal 8 MB, lalu URL disimpan ketika
form produk/drop disimpan. Untuk Vercel, set `DATABASE_URL`, `NEON_AUTH_BASE_URL`,
`NEON_AUTH_COOKIE_SECRET`, dan `UPLOADTHING_TOKEN` sebagai env server, lalu daftarkan domain situs di trusted
domains Neon Auth. Jalankan migrasi dan seed pada branch Neon deployment sebelum
merilis aplikasi. Jangan mengaktifkan pembayaran nyata sebelum order, harga, dan
reservasi stok divalidasi secara transaksional di backend.

CMS `/admin/content` juga mengatur popup promosi berbasis gambar. Gambar contoh
ditampilkan sekali per tab saat pengunjung pertama kali membuka toko; admin dapat
mengunggah gambar promosi resmi atau menonaktifkan popup. Warna brand yang berlaku
adalah maroon `#8B000B` sesuai revisi klien.

## Aturan penting

1. **Katalog dan drop toko memakai Postgres.** Data awal berasal dari seed dummy; checkout demo tetap lewat adapter mock di `apps/web/src/services`.
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
| Foto produk/banner | sementara foto AI di `apps/web/public/images/dummy/` | Gambar baru dapat diunggah melalui UploadThing dari dashboard admin |
| Kontak & sosmed | `apps/web/src/config/site.ts` | Nilai `null` = belum ada |

## Alur demo pembelian

`/shop` mendukung pencarian, kategori, ukuran, stok, dan urutan harga. Pilih varian produk,
tambahkan ke keranjang, lalu buka `/checkout` untuk alamat, kurir, dan metode pembayaran.
Setelah pesanan dibuat, tekan **Simulasikan pembayaran berhasil**. Halaman konfirmasi akan
memperbarui perjalanan pengiriman dalam sekitar 25 detik. `/orders` dapat menemukan kembali
pesanan dengan nomor order dan email/WhatsApp yang dipakai saat checkout.

Pesanan dan pembayaran demo disimpan di `localStorage` browser. Jika customer masuk,
salinan pesanan demo juga disimpan di Postgres, sehingga admin dapat mengubah status dan
customer dapat melihatnya dari `/account/orders`. Ini belum menjadi sistem transaksi
nyata: total berasal dari simulasi browser, stok tidak direservasi, dan tidak ada gateway
pembayaran atau kurir sungguhan. Chat menyimpan pesan customer dan admin di Postgres,
dengan pembaruan tampilan setiap lima detik; isi pesan tidak dienkripsi ujung ke ujung.
