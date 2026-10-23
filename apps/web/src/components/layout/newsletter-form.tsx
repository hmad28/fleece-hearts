"use client";

import { useState } from "react";
import { z } from "zod";

const emailSchema = z.email();

/**
 * Form daftar kabar drop. Mode demo: belum tersambung ke backend/email provider,
 * hanya validasi + konfirmasi di layar. (Tahap 4: POST /api/v1/newsletter)
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  if (state === "done") {
    return (
      <p role="status" className="text-lg">
        Sip, {email} sudah terdaftar. Kami kabari pas drop berikutnya.
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setState(emailSchema.safeParse(email.trim()).success ? "done" : "error");
      }}
      className="w-full max-w-md"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? "newsletter-error" : undefined}
          className="h-12 min-w-0 flex-1 rounded-full border border-paper/30 bg-transparent px-5 text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
        />
        <button type="submit" className="h-12 shrink-0 rounded-full bg-brand px-6 font-medium text-paper hover:bg-brand-press">
          Daftar
        </button>
      </div>
      {state === "error" && (
        <p id="newsletter-error" className="mt-2 text-sm text-paper">
          Format email belum benar. Contoh: nama@email.com
        </p>
      )}
    </form>
  );
}
