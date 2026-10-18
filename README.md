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
4. **Data dummy ditandai `isDummy: true`** dan nama "Contoh …". Jangan karang data klien —
   isi asli menunggu klien (lihat checklist di dokumen rencana §6).
5. Order, payment, dan shipment status dipisah (blueprint §7).

## Aset yang menunggu klien

| Aset | Taruh di | Catatan |
|---|---|---|
| Logo | `apps/web/public/brand/` | Ganti `components/brand/wordmark.tsx` |
| Font Coolvetica | `apps/web/public/fonts/coolvetica-regular.woff2` | Konfirmasi lisensi web dulu |
| Foto produk/banner | sementara isi `url` di mock data; nanti Cloudflare R2 | Placeholder otomatis tampil kalau `url: null` |
| Kontak & sosmed | `apps/web/src/config/site.ts` | Nilai `null` = belum ada |
