"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  return <section className="rounded-[22px] border border-brand/20 bg-[#fbf3f3] p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="text-[1.05rem] font-semibold text-[#24201e]">Verifikasi email</h2><p className="mt-1 text-sm text-stone">Kirim kode ke {email} untuk mengamankan akun dan menerima pembaruan pesanan.</p></div>
      <Button type="button" variant="brand" onClick={() => void send()} disabled={busy}>{busy ? "Mengirim..." : sent ? "Kirim ulang kode" : "Kirim kode"}</Button>
    </div>
    {sent && <form onSubmit={verify} className="mt-5 flex flex-wrap items-end gap-3"><label htmlFor="email-otp" className="min-w-44 flex-1 text-sm font-medium">Kode verifikasi<Input id="email-otp" value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" autoComplete="one-time-code" placeholder="Masukkan kode email" required className="mt-2 bg-white" /></label><Button type="submit" variant="outline" disabled={busy}>Verifikasi</Button></form>}
    {message && <p role="status" className="mt-3 text-sm text-brand">{message}</p>}
  </section>;
}
