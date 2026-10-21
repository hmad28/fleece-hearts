/**
 * Jarak & rute toko → tujuan. Rute jalan dari OSRM (open source) lewat proxy /api/route;
 * kalau gagal, pakai jarak garis lurus × 1,3.
 */
import { STORE_LOCATION } from "@/config/store-location";
import type { LatLng } from "./wilayah";

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  /** [lat, lng][] untuk Leaflet. */
  coords: [number, number][];
  source: "osrm" | "estimate";
}

export function estimateRoute(to: LatLng, from: LatLng = STORE_LOCATION): RouteResult {
  const km = haversineKm(from, to) * 1.3;
  return { distanceKm: km, durationMin: (km / 35) * 60, coords: [[from.lat, from.lng], [to.lat, to.lng]], source: "estimate" };
}

export async function getRoute(to: LatLng, from: LatLng = STORE_LOCATION): Promise<RouteResult> {
  try {
    const res = await fetch(`/api/route?from=${from.lng},${from.lat}&to=${to.lng},${to.lat}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(String(res.status));
    const r = (await res.json()) as { distanceKm: number; durationMin: number; coords: [number, number][] };
    return { ...r, source: "osrm" };
  } catch {
    return estimateRoute(to, from);
  }
}
