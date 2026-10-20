import { dbCatalog } from "@/lib/storefront-data";

export async function GET() {
  const result = await dbCatalog.listProducts({ perPage: 1000 });
  return Response.json(result.items, { headers: { "Cache-Control": "no-store" } });
}
