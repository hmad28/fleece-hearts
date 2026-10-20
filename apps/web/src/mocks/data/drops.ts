/**
 * ⚠️ DATA DUMMY — nama drop, cerita, & jadwal rilis belum dari klien.
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
      name: "Warm Up",
      tagline: "Polar fleece pertama kami, dalam dua warna.",
      description:
        "Chapter pertama Fleece Hearts: jaket polar fleece berkerah tinggi dalam warna Butter dan Black, plus Mark Cap. Stok terbatas, tidak ada restock untuk warna ini.",
      banner: { id: "drop_ch01_banner", url: "/mock/campaign/ch01-wide.svg", alt: "Ilustrasi campaign CH01 Warm Up: dua jaket polar fleece dan topi", width: 3200, height: 2000 },
      releaseAt: nextReleaseAt(now),
      productIds: ["p_006", "p_007", "p_010"],
      isDummy: true,
    },
  ];
}
