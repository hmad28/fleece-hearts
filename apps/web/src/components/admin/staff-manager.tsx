"use client";

import { useState, type FormEvent } from "react";

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
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
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
  return <div className="max-w-3xl space-y-7"><form onSubmit={add} className="grid gap-3 rounded-2xl border border-line p-5 sm:grid-cols-[1fr_9rem_auto]"><label className="text-sm">Email akun<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper p-2" /></label><label className="text-sm">Peran<select value={role} onChange={(event) => setRole(event.target.value as Staff["role"])} className="mt-1 w-full rounded-lg border border-line bg-paper p-2"><option value="ADMIN">Admin</option><option value="OWNER">Owner</option></select></label><button className="self-end rounded-full bg-ink px-5 py-2 text-paper">Simpan</button></form>{message && <p role="status">{message}</p>}<div className="divide-y divide-line rounded-2xl border border-line">{staff.map((item) => <div key={item.email} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><strong>{item.email}</strong><p className="text-sm text-stone">{item.role} · {item.user_id ? "Aktif" : "Menunggu pendaftaran dan verifikasi email"}</p></div>{item.email !== currentEmail.toLowerCase() && <button onClick={() => void remove(item.email)} className="text-sm text-danger underline">Cabut akses</button>}</div>)}</div></div>;
}
