"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Profile = { firstName: string; lastName: string; phone: string; email: string };

export function ProfileSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/account/profile").then((response) => response.ok ? response.json() : Promise.reject())
      .then((value: Profile) => { if (active) setProfile(value); })
      .catch(() => { if (active) setMessage("Profil belum dapat dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!profile) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/account/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Profil gagal disimpan");
      setProfile(result);
      let loginSynced = true;
      try {
        const updated = await authClient.updateUser({ name: [result.firstName, result.lastName].filter(Boolean).join(" ") });
        loginSynced = !updated.error;
      } catch { loginSynced = false; }
      setMessage(loginSynced ? "Profil berhasil disimpan." : "Profil tersimpan. Nama akun login belum tersinkron.");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Profil gagal disimpan."); }
    finally { setBusy(false); }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPasswordBusy(true); setPasswordMessage("");
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword });
      if (result.error) throw new Error(result.error.message ?? "Password gagal diubah.");
      setCurrentPassword(""); setNewPassword(""); setPasswordMessage("Password berhasil diubah.");
    } catch (error) { setPasswordMessage(error instanceof Error ? error.message : "Password gagal diubah. Akun Google mungkin tidak memiliki password."); }
    finally { setPasswordBusy(false); }
  }

  if (loading) return <div aria-busy="true" className="grid gap-5 xl:grid-cols-2">{Array.from({ length: 2 }, (_, index) => <div key={index} className="space-y-5 rounded-[24px] border border-[#e9e2dc] bg-white p-6"><Skeleton className="h-5 w-32" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>)}</div>;
  return <div className="grid gap-5 xl:grid-cols-2">
    <form onSubmit={save} className="space-y-5 rounded-[24px] border border-[#e9e2dc] bg-white p-5 sm:p-7"><h2 className="text-[1.1rem] font-semibold">Informasi pribadi</h2>{profile ? <><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Nama depan<Input required value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} placeholder="Nama depan" className="mt-2" /></label><label className="text-sm font-medium">Nama belakang<Input value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} placeholder="Nama belakang" className="mt-2" /></label></div><label className="block text-sm font-medium">Nomor HP<Input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="08xxxxxxxxxx" className="mt-2" /></label><label className="block text-sm font-medium">Email<Input value={profile.email} readOnly aria-readonly="true" className="mt-2 bg-[#f5f2ee] text-stone" /></label><Button type="submit" variant="brand" disabled={busy}>{busy ? "Menyimpan..." : "Simpan profil"}</Button></> : null}{message && <p role="status" className="text-sm text-brand">{message}</p>}</form>
    <form onSubmit={updatePassword} className="h-fit space-y-5 rounded-[24px] border border-[#e9e2dc] bg-white p-5 sm:p-7"><div><h2 className="text-[1.1rem] font-semibold">Keamanan akun</h2><p className="mt-1 text-sm text-stone">Ubah password akun email. Akun Google dapat tetap masuk lewat Google.</p></div><label className="block text-sm font-medium">Password saat ini<Input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Masukkan password saat ini" className="mt-2" /></label><label className="block text-sm font-medium">Password baru<Input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Minimal 8 karakter" className="mt-2" /></label><Button type="submit" variant="outline" disabled={passwordBusy}>{passwordBusy ? "Memproses..." : "Ubah password"}</Button>{passwordMessage && <p role="status" className="text-sm text-brand">{passwordMessage}</p>}</form>
  </div>;
}
