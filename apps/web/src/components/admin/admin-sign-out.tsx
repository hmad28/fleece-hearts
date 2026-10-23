"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function AdminSignOut() {
  const router = useRouter();
  return <button type="button" onClick={async () => { await authClient.signOut(); router.push("/"); router.refresh(); }} className="text-xs font-medium text-stone underline underline-offset-4 transition-colors hover:text-brand">Keluar</button>;
}
