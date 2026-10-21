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

  async function google() {
    setBusy(true);
    setError("");
    try {
      // Neon Auth (Better Auth) → OAuth Google. Provider Google harus aktif di Neon Console › Auth.
      const result = await authClient.signIn.social({ provider: "google", callbackURL: `${window.location.origin}/account` });
      if (result?.error) setError(result.error.message ?? "Login Google belum aktif. Aktifkan provider Google di Neon Auth.");
    } catch {
      setError("Login Google gagal. Pastikan provider Google aktif dan domain ini terdaftar di Neon Auth.");
    } finally {
      setBusy(false);
    }
  }

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
    <button type="button" onClick={google} disabled={busy} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-ink bg-paper px-6 font-medium transition-colors hover:bg-mist disabled:opacity-50">
      <GoogleIcon />{mode === "signup" ? "Daftar dengan Google" : "Masuk dengan Google"}
    </button>
    <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-stone"><span className="h-px flex-1 bg-line" />atau dengan email<span className="h-px flex-1 bg-line" /></div>
    <form onSubmit={submit} className="mt-6 space-y-5">
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


function GoogleIcon() {
  return <svg viewBox="0 0 48 48" className="size-5" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>;
}
