import pg from "pg";
import { products } from "../src/mocks/data/catalog";
import { getMockDrops } from "../src/mocks/data/drops";

if (!process.env.DATABASE_URL_UNPOOLED) throw new Error("DATABASE_URL_UNPOOLED is required");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();
try {
  for (const product of products) {
    await client.query(
      "INSERT INTO catalog_products (id, slug, data) VALUES ($1,$2,$3::jsonb) ON CONFLICT (id) DO NOTHING",
      [product.id, product.slug, JSON.stringify(product)],
    );
  }
  for (const drop of getMockDrops(new Date())) {
    await client.query(
      "INSERT INTO catalog_drops (id, slug, data) VALUES ($1,$2,$3::jsonb) ON CONFLICT (id) DO NOTHING",
      [drop.id, drop.slug, JSON.stringify(drop)],
    );
  }
  console.log(`Seed complete: ${products.length} catalog products and 1 demo drop (existing edits preserved)`);
} finally {
  await client.end();
}
