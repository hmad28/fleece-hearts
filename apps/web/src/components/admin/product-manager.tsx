"use client";

import type { Product } from "@fh/types";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Package, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Movement = { product_id: string; variant_id: string; delta: number; stock_after: number; reason: string; created_at: string };
type Form = { name: string; slug: string; colorway: string; description: string; material: string; price: number; categoryId: string; weightGram: number; imageUrl: string; status: Product["status"]; isFeatured: boolean; variants: { id?: string; sku: string; size: string; color: string; status: "ACTIVE" | "INACTIVE"; available: number }[] };
const empty: Form = { name: "", slug: "", colorway: "", description: "", material: "", price: 0, categoryId: "cat_hoodie", weightGram: 500, imageUrl: "", status: "DRAFT", isFeatured: false, variants: [{ sku: "", size: "One Size", color: "", status: "ACTIVE", available: 0 }] };
const categories = [["cat_hoodie", "Hoodie"], ["cat_crewneck", "Crewneck"], ["cat_tee", "T-shirt"], ["cat_pants", "Pants"], ["cat_head", "Headwear"], ["cat_bag", "Bags"]];
const selectClass = "mt-1.5 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25";
function toForm(product: Product): Form { return { name: product.name, slug: product.slug, colorway: product.colorway ?? "", description: product.description, material: product.material ?? "", price: product.price, categoryId: product.categoryId, weightGram: product.weightGram, imageUrl: product.images[0]?.url ?? "", status: product.status, isFeatured: product.isFeatured, variants: product.variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size, color: v.color, status: v.status, available: v.available })) }; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1.5 text-xs font-semibold text-ink/80"><span>{label}</span>{children}</label>; }

export function ProductManager({ initial, movements }: { initial: Product[]; movements: Movement[] }) {
  const [products, setProducts] = useState(initial);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState<Form>(empty);
  const [message, setMessage] = useState("");
  const [adjust, setAdjust] = useState<Record<string, { delta: number; reason: string }>>({});
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("catalog");
  const current = products.find((product) => product.id === selected);
  const visible = useMemo(() => products.filter((product) => [product.name, product.slug, product.status].join(" ").toLowerCase().includes(query.toLowerCase())), [products, query]);
  function choose(id: string) { setSelected(id); setForm(id ? toForm(products.find((product) => product.id === id)!) : empty); setMessage(""); setTab("editor"); }
  function variant(index: number, patch: Partial<Form["variants"][number]>) { setForm((value) => ({ ...value, variants: value.variants.map((item, i) => i === index ? { ...item, ...patch } : item) })); }
  async function save(event: FormEvent) {
    event.preventDefault(); setMessage("");
    try {
      const response = await fetch(selected ? `/api/admin/products/${selected}` : "/api/admin/products", { method: selected ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan produk");
      setProducts((items) => [result, ...items.filter((item) => item.id !== result.id)]);
      setSelected(result.id); setForm(toForm(result)); setMessage("Produk tersimpan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan produk."); }
  }
  async function adjustStock(variantId: string) {
    const value = adjust[variantId];
    if (!value) return;
    setMessage("");
    try {
      const response = await fetch(`/api/admin/inventory/${encodeURIComponent(variantId)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyesuaikan stok");
      setProducts((items) => items.map((item) => ({ ...item, variants: item.variants.map((variant) => variant.id === variantId ? { ...variant, available: result.available } : variant) })));
      setForm((value) => ({ ...value, variants: value.variants.map((variant) => variant.id === variantId ? { ...variant, available: result.available } : variant) }));
      setAdjust((value) => ({ ...value, [variantId]: { delta: 0, reason: "" } })); setMessage("Stok tersimpan. Muat ulang untuk melihat mutasi terbaru.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyesuaikan stok."); }
  }
  return <Tabs value={tab} onValueChange={setTab} className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="max-w-full overflow-x-auto"><TabsList className="bg-mist/70"><TabsTrigger value="catalog">Katalog</TabsTrigger><TabsTrigger value="editor">{current ? "Edit produk" : "Produk baru"}</TabsTrigger><TabsTrigger value="inventory">Mutasi stok</TabsTrigger></TabsList></div><Button type="button" variant="brand" size="sm" onClick={() => choose("")}><Plus className="size-4" /> Produk baru</Button></div>
    {message && <p role="status" className="rounded-lg border border-brand/15 bg-brand/5 px-4 py-3 text-sm text-brand">{message}</p>}
    <TabsContent value="catalog">
      <Card className="gap-0 overflow-hidden border-line bg-white py-0 shadow-none">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5"><div><CardTitle className="text-base">Semua produk</CardTitle><CardDescription className="mt-1">{products.length} produk dalam katalog</CardDescription></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" /><Input aria-label="Cari produk" placeholder="Cari nama atau status..." value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" /></div></CardHeader>
        <CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow className="bg-muted/45"><TableHead className="pl-6">Produk</TableHead><TableHead>Status</TableHead><TableHead>Varian</TableHead><TableHead>Stok</TableHead><TableHead>Harga</TableHead><TableHead className="pr-6 text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{visible.map((product) => {
          const stock = product.variants.reduce((sum, item) => sum + item.available, 0);
          return <TableRow key={product.id}><TableCell className="min-w-56 pl-6"><div className="flex items-center gap-3"><div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-mist">{product.images[0]?.url ? <img src={product.images[0].url} alt="" className="size-full object-cover" /> : <Package className="size-5 text-stone" />}</div><div><strong className="block text-sm">{product.name}</strong><small className="text-stone">{product.slug}</small></div></div></TableCell><TableCell><Badge tone={product.status === "ACTIVE" ? "brand" : "muted"}>{product.status}</Badge></TableCell><TableCell>{product.variants.length}</TableCell><TableCell><span className={stock < 5 ? "font-semibold text-danger" : ""}>{stock} pcs</span></TableCell><TableCell className="font-medium tabular-nums">Rp{product.price.toLocaleString("id-ID")}</TableCell><TableCell className="pr-6 text-right"><button type="button" onClick={() => choose(product.id)} className="text-sm font-semibold text-brand hover:underline">Kelola</button></TableCell></TableRow>;
        })}</TableBody></Table>{!visible.length && <div className="p-10 text-center text-sm text-stone">Produk tidak ditemukan.</div>}</CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="editor">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)]">
        <form id="product-form" onSubmit={save} className="space-y-5">
          <Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Informasi produk</CardTitle><CardDescription>Nama, deskripsi, dan harga yang dilihat pelanggan.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
            {([["name","Nama produk"],["slug","Slug URL"],["colorway","Warna utama"],["material","Material"]] as const).map(([key,label]) => <Field key={key} label={label}><Input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></Field>)}
            <div className="sm:col-span-2"><Field label="Deskripsi"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} /></Field></div>
            <Field label="Harga (Rp)"><Input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></Field>
            <Field label="Berat (gram)"><Input type="number" min="1" value={form.weightGram} onChange={(event) => setForm({ ...form, weightGram: Number(event.target.value) })} /></Field>
          </CardContent></Card>
          <Card className="border-line bg-white shadow-none"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="text-base">Varian & ukuran</CardTitle><CardDescription className="mt-1">Atur SKU dan ukuran produk.</CardDescription></div>{!current && <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, variants: [...form.variants, { sku: "", size: "", color: "", status: "ACTIVE", available: 0 }] })}><Plus className="size-4" /> Varian</Button>}</CardHeader><CardContent className="space-y-3">{form.variants.map((item,index) => <div key={item.id ?? index} className="grid gap-3 rounded-lg border border-line bg-muted/30 p-4 sm:grid-cols-2 xl:grid-cols-4"><Field label="SKU"><Input value={item.sku} onChange={(event) => variant(index, { sku: event.target.value })} /></Field><Field label="Ukuran"><Input value={item.size} onChange={(event) => variant(index, { size: event.target.value })} /></Field><Field label="Warna"><Input value={item.color} onChange={(event) => variant(index, { color: event.target.value })} /></Field><Field label={current ? "Stok saat ini" : "Stok awal"}><Input type="number" min="0" disabled={!!current} value={item.available} onChange={(event) => variant(index, { available: Number(event.target.value) })} /></Field></div>)}</CardContent></Card>
        </form>
        <div className="space-y-5">
          <Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Media produk</CardTitle><CardDescription>Gambar utama yang tampil di katalog.</CardDescription></CardHeader><CardContent className="space-y-4"><ImageUpload label="Upload foto produk" value={form.imageUrl} onChange={(url) => setForm((value) => ({ ...value, imageUrl: url }))} /><Field label="URL gambar"><Input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /></Field></CardContent></Card>
          <Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Publikasi</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Kategori"><select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className={selectClass}>{categories.map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select></Field><Field label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Product["status"] })} className={selectClass}><option>DRAFT</option><option>ACTIVE</option><option>ARCHIVED</option></select></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} className="accent-brand" /> Tampilkan sebagai unggulan</label><Button form="product-form" type="submit" variant="brand" block><Save className="size-4" /> Simpan produk</Button></CardContent></Card>
        </div>
      </div>
      {current && <Card className="mt-5 border-line bg-white shadow-none"><CardHeader><CardTitle className="text-base">Penyesuaian stok</CardTitle><CardDescription>Tambah atau kurangi stok dengan alasan yang tercatat di riwayat mutasi.</CardDescription></CardHeader><CardContent className="space-y-3">{current.variants.map((item) => <div key={item.id} className="grid items-end gap-3 rounded-lg border border-line p-4 md:grid-cols-[minmax(10rem,1fr)_7rem_minmax(12rem,1fr)_auto]"><div><strong className="block text-sm">{item.sku} · {item.size}</strong><span className="text-xs text-stone">{item.available} pcs tersedia</span></div><Field label="Selisih"><Input type="number" value={adjust[item.id]?.delta ?? 0} onChange={(event) => setAdjust({ ...adjust, [item.id]: { delta: Number(event.target.value), reason: adjust[item.id]?.reason ?? "" } })} /></Field><Field label="Alasan"><Input value={adjust[item.id]?.reason ?? ""} onChange={(event) => setAdjust({ ...adjust, [item.id]: { delta: adjust[item.id]?.delta ?? 0, reason: event.target.value } })} /></Field><Button type="button" variant="outline" size="sm" onClick={() => void adjustStock(item.id)}>Simpan stok</Button></div>)}</CardContent></Card>}
    </TabsContent>
    <TabsContent value="inventory"><Card className="gap-0 overflow-hidden border-line bg-white py-0 shadow-none"><CardHeader className="border-b border-line py-5"><CardTitle className="text-base">Mutasi stok terakhir</CardTitle><CardDescription>Riwayat 30 perubahan terakhir.</CardDescription></CardHeader><CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Waktu</TableHead><TableHead>Varian</TableHead><TableHead>Perubahan</TableHead><TableHead>Stok akhir</TableHead><TableHead className="pr-6">Alasan</TableHead></TableRow></TableHeader><TableBody>{movements.map((item,index) => <TableRow key={index}><TableCell className="pl-6 whitespace-nowrap text-xs text-stone">{new Date(item.created_at).toLocaleString("id-ID")}</TableCell><TableCell className="text-xs">{item.variant_id}</TableCell><TableCell className={item.delta < 0 ? "font-semibold text-danger" : "font-semibold text-brand"}>{item.delta > 0 ? "+" : ""}{item.delta}</TableCell><TableCell>{item.stock_after}</TableCell><TableCell className="pr-6">{item.reason}</TableCell></TableRow>)}</TableBody></Table>{!movements.length && <p className="p-10 text-center text-sm text-stone">Belum ada mutasi stok.</p>}</CardContent></Card></TabsContent>
  </Tabs>;
}
