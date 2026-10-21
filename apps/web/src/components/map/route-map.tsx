"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { RouteMapProps } from "./route-map-inner";

/** Peta OpenStreetMap (Leaflet). Dimuat hanya di browser. */
const Inner = dynamic(() => import("./route-map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-mist" />,
});

export function RouteMap({ className, ...props }: RouteMapProps) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl bg-mist", className)}>
      <Inner {...props} className="h-full w-full" />
    </div>
  );
}
