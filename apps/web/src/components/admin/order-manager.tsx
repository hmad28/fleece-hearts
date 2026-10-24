"use client";

import type { Order, OrderStatus, ShipmentStatus } from "@fh/types";
import { useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orderStatuses: OrderStatus[] = ["PENDING","CONFIRMED","PROCESSING","PACKED","SHIPPED","DELIVERED","CANCELLED","RETURN_REQUESTED","RETURNED"];
const shipmentStatuses: ShipmentStatus[] = ["PENDING","READY","PICKED_UP","IN_TRANSIT","DELIVERED","FAILED","RETURNED"];
const selectClass = "mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25";

export function OrderManager({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [selected, setSelected] = useState(initial[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const order = orders.find((item) => item.id === selected);
  const visible = useMemo(() => orders.filter((item) => {
    const text = [item.orderNumber, item.customer.name, item.customer.email].join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (filter === "ALL" || item.status === filter);
  }), [orders, query, filter]);
  async function save(value: Order) {
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(value.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: value.status, shipmentStatus: value.shipmentStatus, trackingNumber: value.trackingNumber ?? "", note: "Status diperbarui tim toko" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setOrders((current) => current.map((item) => item.id === value.id ? result : item));
      setMessage(`${value.orderNumber} tersimpan.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan."); }
  }
  function update(id: string, patch: Partial<Order>) { setOrders((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  return <div className="space-y-5">
    {message && <p role="status" className="rounded-lg border border-brand/15 bg-brand/5 px-4 py-3 text-sm text-brand">{message}</p>}
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.85fr)]">
      <Card className="gap-0 overflow-hidden border-line bg-white py-0 shadow-none">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5"><div><CardTitle className="text-base">Daftar pesanan</CardTitle><CardDescription className="mt-1">{orders.length} pesanan tercatat</CardDescription></div><div className="flex w-full flex-wrap gap-2 sm:w-auto"><div className="relative min-w-40 flex-1 sm:w-48"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" /><Input aria-label="Cari pesanan" placeholder="Cari pesanan..." value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" /></div><select aria-label="Filter status" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-md border border-input bg-white px-3 text-xs"><option value="ALL">Semua status</option>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></div></CardHeader>
        <CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead className="pl-6">Pesanan</TableHead><TableHead>Pelanggan</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead className="pr-6 text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{visible.map((item) => <TableRow key={item.id} className={selected === item.id ? "bg-brand/[0.035]" : ""}><TableCell className="pl-6"><strong className="block whitespace-nowrap text-sm">{item.orderNumber}</strong><small className="text-stone">{new Date(item.createdAt).toLocaleDateString("id-ID")}</small></TableCell><TableCell className="min-w-32"><span className="block text-sm">{item.customer.name}</span><small className="block max-w-36 truncate text-stone">{item.customer.email}</small></TableCell><TableCell><Badge tone={item.status === "DELIVERED" ? "brand" : "muted"}>{item.status}</Badge></TableCell><TableCell className="whitespace-nowrap font-semibold tabular-nums">Rp{item.total.toLocaleString("id-ID")}</TableCell><TableCell className="pr-6 text-right"><button type="button" className="text-sm font-semibold text-brand hover:underline" onClick={() => setSelected(item.id)}>Detail</button></TableCell></TableRow>)}</TableBody></Table>{!visible.length && <div className="p-10 text-center text-sm text-stone">Tidak ada pesanan yang cocok.</div>}</CardContent>
      </Card>
      {order ? <Card className="h-fit border-line bg-white shadow-none"><CardHeader className="border-b border-line"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-lg">{order.orderNumber}</CardTitle><CardDescription className="mt-1">{new Date(order.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</CardDescription></div><ShoppingBag className="size-5 text-brand" /></div></CardHeader><CardContent className="space-y-5">
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-stone">Pelanggan</p><strong className="mt-1 block text-sm">{order.customer.name}</strong><p className="text-xs text-stone">{order.customer.email}</p></div>
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-stone">Item pesanan</p><div className="mt-2 divide-y divide-line rounded-lg border border-line">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-3 p-3 text-xs"><span>{item.productName} · {item.quantity}x</span><strong className="whitespace-nowrap">Rp{item.lineTotal.toLocaleString("id-ID")}</strong></div>)}</div><div className="mt-2 flex justify-between text-sm font-bold"><span>Total</span><span>Rp{order.total.toLocaleString("id-ID")}</span></div></div>
        <div className="grid gap-3 border-t border-line pt-4 text-xs"><p><strong>Tujuan:</strong> {[order.shippingAddress.village, order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(", ")}</p><p><strong>Kurir:</strong> {order.courierCode.toUpperCase()} {order.courierService}{order.etaLabel ? ` · ${order.etaLabel}` : ""}</p><p><strong>Pembayaran:</strong> {order.paymentMethodCode} · {order.paymentStatus}</p></div>
        <div className="grid gap-3 border-t border-line pt-4"><label className="text-xs font-semibold">Status pesanan<select value={order.status} onChange={(event) => update(order.id, { status: event.target.value as OrderStatus })} className={selectClass}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-xs font-semibold">Status pengiriman<select value={order.shipmentStatus} onChange={(event) => update(order.id, { shipmentStatus: event.target.value as ShipmentStatus })} className={selectClass}>{shipmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-xs font-semibold">Nomor resi<Input value={order.trackingNumber ?? ""} placeholder="Masukkan nomor resi dari kurir" onChange={(event) => update(order.id, { trackingNumber: event.target.value })} className="mt-1.5" /></label><Button type="button" variant="brand" onClick={() => void save(order)}>Simpan perubahan</Button></div>
      </CardContent></Card> : <Card className="h-fit border-line bg-white shadow-none"><CardContent className="py-12 text-center text-sm text-stone">Pilih pesanan untuk melihat detail.</CardContent></Card>}
    </div>
  </div>;
}
