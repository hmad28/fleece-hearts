"use client";

import { getCountdownParts } from "@fh/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DropCountdownProps {
  releaseAt: string;
  /** Jam server saat halaman dirender — dipakai untuk koreksi jam device. */
  serverNow: string;
  /** "lg" untuk halaman drop, "sm" untuk hero/kartu. */
  size?: "lg" | "sm";
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Countdown berbasis jam SERVER. Selisih jam device dihitung sekali saat mount,
 * jadi pembeli yang jam HP-nya salah tetap lihat waktu yang benar.
 */
export function DropCountdown({ releaseAt, serverNow, size = "lg" }: DropCountdownProps) {
  const target = new Date(releaseAt).getTime();
  const [now, setNow] = useState(() => new Date(serverNow).getTime());

  useEffect(() => {
    const offset = new Date(serverNow).getTime() - Date.now();
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [serverNow]);

  const { days, hours, minutes, seconds, done } = getCountdownParts(target, now);
  const router = useRouter();

  // Begitu waktu rilis lewat, muat ulang data server supaya tombol beli terbuka.
  useEffect(() => {
    if (done) router.refresh();
  }, [done, router]);

  if (done) {
    return <p className={size === "sm" ? "text-lg font-medium" : "font-display text-[clamp(3rem,12vw,9rem)]"}>Sudah rilis</p>;
  }

  const units = [
    { value: days, label: "hari" },
    { value: hours, label: "jam" },
    { value: minutes, label: "menit" },
    { value: seconds, label: "detik" },
  ];

  return (
    <div role="timer" aria-label={`Rilis dalam ${days} hari ${hours} jam ${minutes} menit`}>
      <dl className={size === "sm" ? "flex gap-6" : "grid grid-cols-4 gap-2 sm:gap-6"}>
        {units.map((u) => (
          <div key={u.label} className="flex flex-col-reverse">
            <dt className={size === "sm" ? "mt-1 text-xs" : "mt-2 text-sm sm:text-base"}>{u.label}</dt>
            <dd
              className={size === "sm" ? "font-display tabular text-[2.5rem]" : "font-display tabular text-[clamp(3rem,13vw,7rem)]"}
              aria-hidden
            >
              {pad(u.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
