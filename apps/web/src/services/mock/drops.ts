import type { DropWithStatus } from "@fh/types";
import { getDropStatus, getProductStockStatus } from "@fh/shared";
import { getMockDrops } from "@/mocks/data/drops";
import type { DropService } from "../contracts";
import type { MockCatalogService } from "./catalog";
import { delay } from "./delay";

export class MockDropService implements DropService {
  constructor(private readonly catalog: MockCatalogService) {}

  private async withStatus(now: Date): Promise<DropWithStatus[]> {
    const drops = getMockDrops(now);
    return Promise.all(
      drops.map(async (drop) => {
        const items = await this.catalog.getProductsByIds(drop.productIds);
        const allSoldOut = items.length > 0 && items.every((p) => getProductStockStatus(p) === "OUT_OF_STOCK");
        return { ...drop, status: getDropStatus(drop, now, allSoldOut) };
      }),
    );
  }

  async listDrops() {
    if (typeof window !== "undefined") {
      const response = await fetch("/api/drops", { cache: "no-store" });
      if (!response.ok) throw new Error("Jadwal drop gagal dimuat");
      return response.json() as Promise<{ drops: DropWithStatus[]; serverNow: string }>;
    }
    await delay();
    // Di backend asli, `now` = jam server. Di mock, jam proses Next.js.
    const now = new Date();
    return { drops: await this.withStatus(now), serverNow: now.toISOString() };
  }

  async getDropBySlug(slug: string) {
    const { drops, serverNow } = await this.listDrops();
    const drop = drops.find((d) => d.slug === slug);
    return drop ? { drop, serverNow } : null;
  }
}
