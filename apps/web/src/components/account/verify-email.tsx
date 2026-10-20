"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

export function VerifyEmail({ email }: { email: string }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true); setMessage("");
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      if (result.error) throw new Error(result.error.message);
      setSent(true); setMessage("Kode verifikasi dikirim ke email Anda.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kode gagal dikirim."); }
    finally { setBusy(false); }
  }

  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const result = await authClient.emailOtp.verifyEmail({ email, otp });
      if (result.error) throw new Error(result.error.message);
      setMessage("Email terverifikasi. Akses akun diperbarui.");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kode tidak valid."); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-mist p-5">
    <h2 className="font-display text-2xl">Verifikasi email</h2>
    <p className="mt-2 text-sm">Verifikasi {email} untuk mengaktifkan akses staf dan menjaga akun Anda.</p>
    <button type="button" onClick={() => void send()} disabled={busy} className="mt-4 rounded-full bg-ink px-5 py-2 text-sm text-paper disabled:opacity-50">Kirim kode ke email</button>
    {sent && <form onSubmit={verify} className="mt-4 flex flex-wrap gap-2"><label className="sr-only" htmlFor="email-otp">Kode verifikasi</label><input id="email-otp" value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" autoComplete="one-time-code" placeholder="Kode verifikasi" required className="rounded-lg border border-line bg-paper px-3 py-2" /><button disabled={busy} className="rounded-full bg-ink px-5 py-2 text-sm text-paper disabled:opacity-50">Verifikasi</button></form>}
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
  </section>;
}
