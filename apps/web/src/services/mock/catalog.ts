import type { Category, ID, Paginated, Product, ProductListQuery, SizeGuide } from "@fh/types";
import { getProductStockStatus } from "@fh/shared";
import { categories, products, sizeGuides } from "@/mocks/data/catalog";
import type { CatalogService } from "../contracts";
import { delay } from "./delay";

export class MockCatalogService implements CatalogService {
  async listProducts(query: ProductListQuery = {}): Promise<Paginated<Product>> {
    await delay();
    const { page = 1, perPage = 24 } = query;
    let list = products.filter((p) => p.status === "ACTIVE");

    if (query.categorySlug) {
      const cat = categories.find((c) => c.slug === query.categorySlug);
      list = cat ? list.filter((p) => p.categoryId === cat.id) : [];
    }
    if (query.dropSlug) {
      list = list.filter((p) => p.dropId === `drop_${query.dropSlug}`);
    }
    if (query.size) {
      list = list.filter((p) => p.variants.some((v) => v.size === query.size && v.available > 0));
    }
    if (query.availableOnly) {
      list = list.filter((p) => getProductStockStatus(p) !== "OUT_OF_STOCK");
    }

    const sorted = [...list].sort((a, b) => {
      switch (query.sort) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    const start = (page - 1) * perPage;
    return { items: sorted.slice(start, start + perPage), page, perPage, total: sorted.length };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    await delay();
    return products.find((p) => p.slug === slug && p.status === "ACTIVE") ?? null;
  }

  async getProductsByIds(ids: ID[]): Promise<Product[]> {
    await delay(100);
    return ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  }

  async listCategories(): Promise<Category[]> {
    await delay(100);
    return categories;
  }

  async getSizeGuide(id: ID): Promise<SizeGuide | null> {
    await delay(100);
    return sizeGuides.find((s) => s.id === id) ?? null;
  }
}
