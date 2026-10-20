import { dbDrops } from "@/lib/storefront-data";

export async function GET() {
  return Response.json(await dbDrops(), { headers: { "Cache-Control": "no-store" } });
}
