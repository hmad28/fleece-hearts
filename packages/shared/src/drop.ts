import type { Drop, DropStatus } from "@fh/types";

/**
 * Status drop diturunkan dari waktu SERVER, bukan jam device pembeli.
 * `now` wajib dikirim dari server (atau dikoreksi dengan offset server).
 */
export function getDropStatus(
  drop: Pick<Drop, "releaseAt" | "endAt">,
  now: Date,
  allSoldOut: boolean,
): DropStatus {
  const release = new Date(drop.releaseAt).getTime();
  const t = now.getTime();
  if (t < release) return "UPCOMING";
  if (drop.endAt && t >= new Date(drop.endAt).getTime()) return "ENDED";
  if (allSoldOut) return "SOLD_OUT";
  return "LIVE";
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function getCountdownParts(targetMs: number, nowMs: number): CountdownParts {
  const diff = Math.max(0, targetMs - nowMs);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff === 0,
  };
}
