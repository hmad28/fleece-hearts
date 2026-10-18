import { cn } from "@/lib/utils";

/**
 * Wordmark sementara (teks Coolvetica) sampai logo asli dari klien masuk.
 * Ganti isi komponen ini dengan <Image src="/brand/logo.svg" .../> nanti.
 */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-display text-[1.6rem] leading-none", className)}>Fleece Hearts</span>;
}
