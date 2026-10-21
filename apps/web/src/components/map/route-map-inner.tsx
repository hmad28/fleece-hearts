"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLng } from "@/lib/geo/wilayah";

export interface RouteMapProps {
  origin: LatLng & { label: string };
  destination?: (LatLng & { label: string }) | null;
  route?: [number, number][];
  /** 0..1 posisi kurir di sepanjang rute; undefined = tidak tampil. */
  courierProgress?: number;
  className?: string;
}

const pin = (bg: string, fg: string, inner: string) =>
  L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div style="width:34px;height:34px;border-radius:999px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.25);border:2px solid #fff">${inner}</div>`,
  });

const LOGO_SVG = `<svg viewBox="300 205 1030 1206" width="16" height="18" fill="none" stroke="currentColor" stroke-width="110" stroke-linecap="round"><path d="M581 258 L564 1280"/><path d="M363 590 L1240 415"/><path d="M1018 668 L1035 1358"/><path d="M352 1102 L1276 898"/></svg>`;
const HOME_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>`;
const TRUCK_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>`;

const storeIcon = pin("#000", "#FFC200", LOGO_SVG);
const homeIcon = pin("#FFC200", "#000", HOME_SVG);
const courierIcon = pin("#fff", "#000", TRUCK_SVG);

/** Titik di sepanjang polyline berdasarkan proporsi jarak. */
function pointAlong(coords: [number, number][], t: number): [number, number] {
  if (coords.length < 2) return coords[0] ?? [0, 0];
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [a, b] = [coords[i - 1]!, coords[i]!];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(d);
    total += d;
  }
  let target = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    const d = seg[i]!;
    if (target <= d) {
      const [a, b] = [coords[i]!, coords[i + 1]!];
      const k = d === 0 ? 0 : target / d;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    target -= d;
  }
  return coords[coords.length - 1]!;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length === 1) map.setView(points[0]!, 13);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [36, 36] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function RouteMapInner({ origin, destination, route, courierProgress, className }: RouteMapProps) {
  const line = useMemo<[number, number][]>(
    () => route ?? (destination ? [[origin.lat, origin.lng], [destination.lat, destination.lng]] : []),
    [route, origin, destination],
  );
  const fitPoints = useMemo<[number, number][]>(
    () => (line.length ? line : [[origin.lat, origin.lng]]),
    [line, origin],
  );
  const courier = courierProgress !== undefined && line.length > 1 ? pointAlong(line, courierProgress) : null;

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={12}
      scrollWheelZoom={false}
      className={className}
      style={{ background: "#ece6dc" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="fh-map-tiles"
      />
      {line.length > 1 && (
        <>
          <Polyline positions={line} pathOptions={{ color: "#000", weight: 6, opacity: 0.18 }} />
          <Polyline positions={line} pathOptions={{ color: "#000", weight: 3, dashArray: courier ? undefined : "2 8" }} />
        </>
      )}
      <Marker position={[origin.lat, origin.lng]} icon={storeIcon}>
        <Tooltip direction="top" offset={[0, -16]}>
          {origin.label}
        </Tooltip>
      </Marker>
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={homeIcon}>
          <Tooltip direction="top" offset={[0, -16]}>
            {destination.label}
          </Tooltip>
        </Marker>
      )}
      {courier && (
        <Marker position={courier} icon={courierIcon} zIndexOffset={1000}>
          <Tooltip direction="top" offset={[0, -16]} permanent>
            Kurir
          </Tooltip>
        </Marker>
      )}
      <FitBounds points={fitPoints} />
    </MapContainer>
  );
}
