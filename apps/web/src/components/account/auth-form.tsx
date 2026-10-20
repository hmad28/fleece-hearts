"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Autentikasi gagal. Periksa kembali data Anda.");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi layanan akun. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="mx-auto max-w-md px-4 py-16 md:py-24">
    <p className="text-sm uppercase tracking-widest text-stone">Fleece Hearts</p>
    <h1 className="font-display mt-3 text-5xl">{mode === "signup" ? "Buat akun" : "Masuk"}</h1>
    <p className="mt-3 text-stone">Simpan alamat agar checkout berikutnya lebih cepat.</p>
    <form onSubmit={submit} className="mt-8 space-y-5">
      {mode === "signup" && <label className="block text-sm">Nama<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 h-12 w-full rounded-xl border border-line bg-paper px-4" /></label>}
      <label className="block text-sm">Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 h-12 w-full rounded-xl border border-line bg-paper px-4" /></label>
      <label className="block text-sm">Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required className="mt-1 h-12 w-full rounded-xl border border-line bg-paper px-4" /></label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-ink px-6 text-paper disabled:opacity-50">{busy ? "Memproses…" : mode === "signup" ? "Daftar" : "Masuk"}</button>
    </form>
    <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }} className="mt-5 text-sm underline">{mode === "signin" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}</button>
    <p className="mt-8 text-sm text-stone">Ingin belanja tanpa akun? <Link href="/shop" className="underline">Lanjut ke shop</Link></p>
  </div>;
}
