/**
 * ⚠️ DATA CONTOH — nama drop & jadwal rilis belum dari klien.
 */
import type { Drop } from "@fh/types";

/**
 * Jadwal rilis contoh: 3 hari dari sekarang, jam 19.00 WIB (12.00 UTC).
 * Dihitung saat dipanggil supaya countdown di demo selalu jalan.
 */
function nextReleaseAt(now: Date): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + 3);
  d.setUTCHours(12, 0, 0, 0);
  return d.toISOString();
}

export function getMockDrops(now: Date): Drop[] {
  return [
    {
      id: "drop_ch01",
      slug: "ch01",
      code: "CH01",
      name: "Drop contoh",
      tagline: "Nama dan cerita drop menyusul dari klien.",
      banner: { id: "drop_ch01_banner", url: null, alt: "Banner drop CH01" },
      releaseAt: nextReleaseAt(now),
      productIds: ["p_007", "p_008", "p_009"],
      isDummy: true,
    },
  ];
}
