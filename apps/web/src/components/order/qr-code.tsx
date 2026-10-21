"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** QR simulasi (bukan QRIS sungguhan). Dirender lokal, tanpa layanan pihak ketiga. */
export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: size * 2, color: { dark: "#000000", light: "#ffffff" } })
      .then((url) => { if (!cancelled) setSrc(url); })
      .catch(() => setSrc(null));
    return () => { cancelled = true; };
  }, [value, size]);
  return (
    <div className="inline-flex flex-col items-center rounded-2xl bg-white p-4" style={{ width: size + 32 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Kode QR pembayaran simulasi" width={size} height={size} />
      ) : (
        <div className="animate-pulse bg-mist" style={{ width: size, height: size }} />
      )}
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-stone">QRIS demo · jangan dipindai</p>
    </div>
  );
}
