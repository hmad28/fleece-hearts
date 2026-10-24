"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/account")) return null;
  return <>{children}</>;
}
