/**
 * Data wilayah Indonesia (provinsi → kab/kota → kecamatan → kelurahan) dari
 * https://github.com/ibnux/data-indonesia (open data, GitHub Pages, CORS *).
 * Kelurahan sudah punya koordinat; kalau kosong, fallback geocode ke Nominatim (OpenStreetMap).
 */
export interface LatLng { lat: number; lng: number }

const BASE = "https://ibnux.github.io/data-indonesia";

export interface Region {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
}

const cache = new Map<string, Promise<Region[]>>();

function load(path: string): Promise<Region[]> {
  const hit = cache.get(path);
  if (hit) return hit;
  const p = fetch(`${BASE}/${path}`)
    .then((r) => {
      if (!r.ok) throw new Error(`Gagal memuat wilayah (${r.status})`);
      return r.json() as Promise<{ id: string; nama: string; latitude: number; longitude: number }[]>;
    })
    .then((rows) =>
      rows
        .map((x) => ({
          id: x.id,
          name: x.nama,
          lat: x.latitude || undefined,
          lng: x.longitude || undefined,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "id")),
    );
  p.catch(() => cache.delete(path));
  cache.set(path, p);
  return p;
}

export const wilayah = {
  provinces: () => load("provinsi.json"),
  regencies: (provinceId: string) => load(`kabupaten/${provinceId}.json`),
  districts: (regencyId: string) => load(`kecamatan/${regencyId}.json`),
  villages: (districtId: string) => load(`kelurahan/${districtId}.json`),
};

/** Fallback koordinat dari nama wilayah via Nominatim (OSM). */
export async function geocode(query: string): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } },
    );
    const rows = (await res.json()) as { lat: string; lon: string }[];
    const r = rows[0];
    return r ? { lat: Number(r.lat), lng: Number(r.lon) } : null;
  } catch {
    return null;
  }
}
