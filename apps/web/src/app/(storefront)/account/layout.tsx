import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth/server";
import { AccountShell } from "@/components/account/account-shell";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  return <AccountShell email={data.user.email}>{children}</AccountShell>;
}
