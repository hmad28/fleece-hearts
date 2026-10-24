import type { Product } from "@fh/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { auth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const { rows } = await getDb().query<{ data: Product }>(
    `SELECT p.data FROM account_wishlist w JOIN catalog_products p ON p.id=w.product_id
     WHERE w.user_id=$1 AND p.data->>'status'='ACTIVE' ORDER BY w.created_at DESC`, [data.user.id],
  );
  return rows.length ? <div className="space-y-5"><p className="text-sm text-stone">{rows.length} produk tersimpan. Pilih ukuran lewat tombol + pada kartu untuk menambah ke keranjang.</p><div className="grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-4">{rows.map(({ data: product }) => <ProductCard key={product.id} product={product} />)}</div></div> : <div className="rounded-[24px] border border-[#e9e2dc] bg-white px-6 py-16 text-center"><Heart className="mx-auto size-9 text-brand" strokeWidth={1.5} /><h2 className="mt-4 text-[1.1rem] font-semibold">Belum ada produk tersimpan</h2><p className="mt-2 text-sm text-stone">Ketuk ikon hati pada produk yang kamu suka.</p><Link href="/shop" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Jelajahi produk <ArrowRight className="size-4" /></Link></div>;
}
