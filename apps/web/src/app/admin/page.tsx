import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const dateLabel = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date());
  const db = getDb();
  const [products, orders, conversations, movements] = await Promise.all([
    db.query<{ count: string; low_stock: string }>(`SELECT count(*)::text AS count, count(*) FILTER (WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(data->'variants') v WHERE (v->>'available')::int < 5))::text AS low_stock FROM catalog_products`),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM demo_orders"),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM chat_conversations"),
    db.query<{ count: string }>("SELECT count(*)::text AS count FROM inventory_movements"),
  ]);

  const stats = [
    { number: "01", label: "Produk di katalog", value: products.rows[0]?.count ?? "0", detail: "Kelola informasi dan varian", href: "/admin/products" },
    { number: "02", label: "Perlu cek stok", value: products.rows[0]?.low_stock ?? "0", detail: "Produk dengan varian di bawah 5", href: "/admin/products" },
    { number: "03", label: "Pesanan masuk", value: orders.rows[0]?.count ?? "0", detail: "Pesanan dari simulasi checkout", href: "/admin/orders" },
    { number: "04", label: "Percakapan", value: conversations.rows[0]?.count ?? "0", detail: "Pesan dari customer", href: "/admin/chat" },
  ];
  const tasks = [
    { number: "01", title: "Atur produk & stok", description: "Tambah produk, foto, ukuran, dan ketersediaan.", href: "/admin/products" },
    { number: "02", title: "Periksa pesanan", description: "Lihat pembelian dan perbarui status pengiriman.", href: "/admin/orders" },
    { number: "03", title: "Ubah tampilan toko", description: "Kelola konten beranda dan gambar promosi.", href: "/admin/content" },
    { number: "04", title: "Balas pelanggan", description: "Buka pesan yang masuk dari customer.", href: "/admin/chat" },
  ];

  return <div className="space-y-10 lg:space-y-12">
    <section className="relative overflow-hidden rounded-[1.5rem] bg-brand px-6 py-9 text-paper sm:px-10 sm:py-12 lg:px-12">
      <div className="absolute -right-9 -top-16 select-none font-display text-[16rem] leading-none text-paper/[0.06]" aria-hidden>FH</div>
      <div className="relative z-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-paper/70">Fleece Hearts / Control room</p>
          <h1 className="font-display mt-6 max-w-2xl text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">Kendali toko,<br />di satu tempat.</h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-paper/75 sm:text-base">Pantau apa yang perlu dikerjakan hari ini, lalu lanjut langsung ke bagian yang dibutuhkan.</p>
        </div>
        <div className="border-t border-paper/30 pt-5 text-left lg:min-w-48 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-paper/60">Masuk sebagai</p>
          <p className="mt-2 text-sm font-semibold">{admin.email}</p>
          <p className="mt-4 text-xs text-paper/60">{dateLabel}</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="store-pulse">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand">Hari ini / Ringkasan</p><h2 id="store-pulse" className="font-display mt-3 text-4xl sm:text-5xl">Kondisi toko</h2></div><p className="max-w-xs text-xs leading-relaxed text-stone">Angka pesanan berasal dari simulasi checkout.</p></div>
      <div className="grid overflow-hidden rounded-2xl border border-line bg-white/55 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => <Link key={stat.number} href={stat.href} className={`group flex min-h-56 flex-col justify-between p-6 transition-colors hover:bg-mist/70 sm:p-7 ${index < 3 ? "border-b border-line xl:border-b-0 xl:border-r" : ""} ${index === 0 ? "sm:border-r" : ""} ${index === 1 ? "sm:border-r-0 xl:border-r" : ""} ${index === 2 ? "sm:border-r" : ""}`}>
          <div className="flex justify-between gap-4"><span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone">{stat.number} / {stat.label}</span><ArrowUpRight className="size-4 shrink-0 text-stone transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden /></div>
          <div><strong className="font-display block text-6xl leading-none tabular sm:text-7xl">{stat.value}</strong><p className="mt-3 text-xs text-stone">{stat.detail}</p></div>
        </Link>)}
      </div>
    </section>

    <section aria-labelledby="quick-actions" className="grid gap-8 border-t border-ink pt-8 lg:grid-cols-[minmax(12rem,0.36fr)_minmax(0,1fr)] lg:gap-12">
      <div><p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand">Langkah berikutnya</p><h2 id="quick-actions" className="font-display mt-4 text-4xl sm:text-5xl">Mulai dari sini.</h2><p className="mt-5 text-sm leading-relaxed text-stone">{movements.rows[0]?.count ?? "0"} perubahan stok tercatat.</p></div>
      <div className="border-t border-line">
        {tasks.map((task) => <Link key={task.href} href={task.href} className="group flex items-center gap-5 border-b border-line py-5 transition-colors hover:text-brand sm:gap-8 sm:py-6"><span className="text-xs font-semibold tabular text-stone">{task.number}</span><span className="min-w-0 flex-1"><strong className="block text-base font-semibold sm:text-lg">{task.title}</strong><span className="mt-1 block text-xs text-stone sm:text-sm">{task.description}</span></span><ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden /></Link>)}
      </div>
    </section>
  </div>;
}
