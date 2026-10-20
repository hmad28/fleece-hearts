import type { DropWithStatus, ID } from "@fh/types";
import { dbDrops } from "@/lib/storefront-data";

export interface DropContext {
  drops: DropWithStatus[];
  serverNow: string;
  /** productId → kode drop, hanya untuk drop yang BELUM rilis (produk dikunci). */
  lockedByProduct: Map<ID, DropWithStatus>;
  /** Drop terdekat yang upcoming/live — dipakai hero & announcement. */
  featured: DropWithStatus | undefined;
}

export async function getDropContext(): Promise<DropContext> {
  const { drops, serverNow } = await dbDrops();
  const lockedByProduct = new Map<ID, DropWithStatus>();
  for (const d of drops) {
    if (d.status !== "UPCOMING") continue;
    for (const id of d.productIds) lockedByProduct.set(id, d);
  }
  const featured = drops
    .filter((d) => d.status === "UPCOMING" || d.status === "LIVE")
    .sort((a, b) => a.releaseAt.localeCompare(b.releaseAt))[0];
  return { drops, serverNow, lockedByProduct, featured };
}
