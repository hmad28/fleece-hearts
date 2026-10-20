import "server-only";
import type { Category, Drop, DropWithStatus, ID, Paginated, Product, ProductListQuery, SizeGuide } from "@fh/types";
import { getDropStatus, getProductStockStatus } from "@fh/shared";
import { categories, sizeGuides } from "@/mocks/data/catalog";
import { getDb } from "@/lib/db";

async function allProducts(): Promise<Product[]> {
  const { rows } = await getDb().query<{ data: Product }>("SELECT data FROM catalog_products ORDER BY (data->>'createdAt') DESC");
  return rows.map((row) => row.data);
}

export const dbCatalog = {
  async listProducts(query: ProductListQuery = {}): Promise<Paginated<Product>> {
    const { page = 1, perPage = 24 } = query;
    let list = (await allProducts()).filter((p) => p.status === "ACTIVE");
    if (query.search?.trim()) {
      const needle = query.search.trim().toLocaleLowerCase("id-ID");
      list = list.filter((p) => [p.name, p.colorway, p.description, ...p.variants.map((v) => v.sku)]
        .some((value) => value?.toLocaleLowerCase("id-ID").includes(needle)));
    }
    if (query.categorySlug) {
      const category = categories.find((c) => c.slug === query.categorySlug);
      list = category ? list.filter((p) => p.categoryId === category.id) : [];
    }
    if (query.dropSlug) {
      const { rows } = await getDb().query<{ data: Drop }>("SELECT data FROM catalog_drops WHERE slug=$1", [query.dropSlug]);
      const ids = new Set(rows[0]?.data.productIds ?? []);
      list = list.filter((p) => ids.has(p.id));
    }
    if (query.size) list = list.filter((p) => p.variants.some((v) => v.size === query.size && v.status === "ACTIVE" && v.available > 0));
    if (query.availableOnly) list = list.filter((p) => getProductStockStatus(p) !== "OUT_OF_STOCK");
    list.sort((a, b) => query.sort === "price_asc" ? a.price - b.price
      : query.sort === "price_desc" ? b.price - a.price
      : b.createdAt.localeCompare(a.createdAt));
    return { items: list.slice((page - 1) * perPage, page * perPage), page, perPage, total: list.length };
  },
  async getProductBySlug(slug: string): Promise<Product | null> {
    const { rows } = await getDb().query<{ data: Product }>("SELECT data FROM catalog_products WHERE slug = $1", [slug]);
    const product = rows[0]?.data;
    return product?.status === "ACTIVE" ? product : null;
  },
  async getProductsByIds(ids: ID[]): Promise<Product[]> {
    if (!ids.length) return [];
    const { rows } = await getDb().query<{ data: Product }>("SELECT data FROM catalog_products WHERE id = ANY($1::text[])", [ids]);
    const byId = new Map(rows.map((row) => [row.data.id, row.data]));
    return ids.map((id) => byId.get(id)).filter((product): product is Product => product?.status === "ACTIVE");
  },
  async listCategories(): Promise<Category[]> { return categories; },
  async getSizeGuide(id: ID): Promise<SizeGuide | null> { return sizeGuides.find((guide) => guide.id === id) ?? null; },
};

export async function dbDrops(): Promise<{ drops: DropWithStatus[]; serverNow: string }> {
  const now = new Date();
  const { rows } = await getDb().query<{ data: Drop }>("SELECT data FROM catalog_drops ORDER BY (data->>'releaseAt')");
  const drops = await Promise.all(rows.map(async ({ data }) => {
    const items = await dbCatalog.getProductsByIds(data.productIds);
    const soldOut = items.length > 0 && items.every((p) => getProductStockStatus(p) === "OUT_OF_STOCK");
    return { ...data, status: getDropStatus(data, now, soldOut) };
  }));
  return { drops, serverNow: now.toISOString() };
}
