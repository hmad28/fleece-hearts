import { cn } from "@/lib/utils";

/** Empat goresan logo Fleece Hearts (divektorkan dari logo klien, viewBox 1600×1600 asli). */
export const LOGO_STROKES = [
  "M581 258 L564 1280",
  "M363 590 L1240 415",
  "M1018 668 L1035 1358",
  "M352 1102 L1276 898",
] as const;

export const LOGO_VIEWBOX = "300 205 1030 1206";

interface LogoMarkProps {
  className?: string;
  /** Animasi menggambar sekali saat muncul (dipakai di hero saja). */
  draw?: boolean;
  title?: string;
}

export function LogoMark({ className, draw, title }: LogoMarkProps) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={96}
      strokeLinecap="round"
      className={cn("block", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {LOGO_STROKES.map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          style={
            draw
              ? {
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: `fh-draw 520ms var(--ease-out-soft) ${120 + i * 140}ms forwards`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

/** Logo lengkap: mark + nama. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-7 w-auto" />
      <span className="font-display text-[1.45rem] leading-none tracking-[-0.03em]">Fleece Hearts</span>
    </span>
  );
}
