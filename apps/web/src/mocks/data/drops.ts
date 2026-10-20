/**
 * ⚠️ DATA DUMMY — nama drop, cerita, & jadwal rilis belum dari klien.
 */
import type { Drop } from "@fh/types";

/** Jadwal tetap agar status drop tidak bergeser pada setiap request. */
const DEMO_RELEASE_AT = "2026-10-21T12:00:00.000Z";

export function getMockDrops(_now: Date): Drop[] {
  return [
    {
      id: "drop_ch01",
      slug: "ch01",
      code: "CH01",
      name: "Warm Up",
      tagline: "Polar fleece pertama kami, dalam dua warna.",
      description:
        "Chapter pertama Fleece Hearts: jaket polar fleece berkerah tinggi dalam warna Butter dan Black, plus Mark Cap. Stok terbatas, tidak ada restock untuk warna ini.",
      banner: { id: "drop_ch01_banner", url: "/images/dummy/campaign-wide.jpg", alt: "Dua model memakai polar fleece hitam dan kuning di depan dinding pasir", width: 1376, height: 768 },
      releaseAt: DEMO_RELEASE_AT,
      productIds: ["p_006", "p_007", "p_010"],
      isDummy: true,
    },
  ];
}
