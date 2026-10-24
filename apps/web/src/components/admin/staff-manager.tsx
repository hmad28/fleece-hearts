"use client";

import { useState, type FormEvent } from "react";
import { Mail, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Staff = { email: string; role: "OWNER" | "ADMIN"; user_id: string | null; created_at: string };
export function StaffManager({ initial, currentEmail }: { initial: Staff[]; currentEmail: string }) {
  const [staff, setStaff] = useState(initial);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Staff["role"]>("ADMIN");
  const [message, setMessage] = useState("");
  async function add(event: FormEvent) {
    event.preventDefault(); setMessage("");
    try {
      const response = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setStaff((items) => [...items.filter((item) => item.email !== result.email), result]);
      setEmail(""); setMessage("Akses staf tersimpan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan staf."); }
  }
  async function remove(emailToRemove: string) {
    if (!window.confirm(`Cabut akses ${emailToRemove}?`)) return;
    setMessage("");
    try {
      const response = await fetch(`/api/admin/staff/${encodeURIComponent(emailToRemove)}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).error);
      setStaff((items) => items.filter((item) => item.email !== emailToRemove)); setMessage("Akses staf dicabut.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal mencabut akses."); }
  }
  return <div className="space-y-5">
    {message && <p role="status" className="rounded-lg border border-brand/15 bg-brand/5 px-4 py-3 text-sm text-brand">{message}</p>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.75fr)]">
      <Card className="h-fit gap-0 overflow-hidden border-line bg-white py-0 shadow-none"><CardHeader className="border-b border-line py-5"><CardTitle className="flex items-center gap-2 text-base"><Users className="size-4 text-brand" /> Anggota tim</CardTitle><CardDescription>{staff.length} akun memiliki akses admin</CardDescription></CardHeader><CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Email</TableHead><TableHead>Peran</TableHead><TableHead>Status</TableHead><TableHead className="pr-6 text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{staff.map((item) => <TableRow key={item.email}><TableCell className="pl-6"><strong className="block text-sm">{item.email}</strong><small className="text-stone">Sejak {new Date(item.created_at).toLocaleDateString("id-ID")}</small></TableCell><TableCell><Badge tone={item.role === "OWNER" ? "brand" : "muted"}>{item.role}</Badge></TableCell><TableCell className="text-xs">{item.user_id ? <span className="text-brand">Aktif</span> : <span className="text-stone">Menunggu verifikasi</span>}</TableCell><TableCell className="pr-6 text-right">{item.email !== currentEmail.toLowerCase() && <button type="button" onClick={() => void remove(item.email)} className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline"><Trash2 className="size-3.5" /> Cabut</button>}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      <div className="space-y-5"><Card className="border-line bg-white shadow-none"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="size-4 text-brand" /> Tambah staf</CardTitle><CardDescription>Masukkan email akun yang sudah terdaftar.</CardDescription></CardHeader><CardContent><form onSubmit={add} className="space-y-4"><label className="block text-xs font-semibold">Email akun<div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" /><Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="pl-9" placeholder="nama@fleecehearts.com" /></div></label><label className="block text-xs font-semibold">Peran<select value={role} onChange={(event) => setRole(event.target.value as Staff["role"])} className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="ADMIN">Admin</option><option value="OWNER">Owner</option></select></label><Button type="submit" variant="brand" block>Simpan akses</Button></form></CardContent></Card><Card className="gap-2 border-brand/15 bg-brand/5 shadow-none"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="size-4 text-brand" /> Keamanan akses</CardTitle></CardHeader><CardContent className="text-xs leading-5 text-stone">Staf baru dapat masuk setelah mendaftar dan memverifikasi email. Owner dapat mencabut akses kapan saja.</CardContent></Card></div>
    </div>
  </div>;
}
