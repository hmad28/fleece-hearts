import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy rute jalan ke OSRM (open source routing, data OpenStreetMap).
 * Lewat server supaya tidak kena CORS dan hasilnya bisa di-cache.
 * GET /api/route?from=lng,lat&to=lng,lat
 */
const COORD = /^-?\d{1,3}(\.\d+)?,-?\d{1,2}(\.\d+)?$/;

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? "";
  const to = req.nextUrl.searchParams.get("to") ?? "";
  if (!COORD.test(from) || !COORD.test(to)) {
    return NextResponse.json({ error: "Parameter from/to harus format lng,lat" }, { status: 400 });
  }
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=simplified&geometries=geojson`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "fleece-hearts-demo/0.1" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const r = data.routes?.[0];
    if (!r) throw new Error("no route");
    return NextResponse.json(
      { distanceKm: r.distance / 1000, durationMin: r.duration / 60, coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]) },
      { headers: { "Cache-Control": "public, max-age=86400" } },
    );
  } catch (e) {
    return NextResponse.json({ error: `Rute tidak tersedia (${(e as Error).message})` }, { status: 502 });
  }
}
