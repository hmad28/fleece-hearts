import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth/server";
import { AccountShell } from "@/components/account/account-shell";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const { rows } = await getDb().query<{ first_name: string; last_name: string }>("SELECT first_name,last_name FROM account_profiles WHERE user_id=$1", [data.user.id]);
  const name = [rows[0]?.first_name, rows[0]?.last_name].filter(Boolean).join(" ") || data.user.name || "";
  return <AccountShell email={data.user.email} name={name}>{children}</AccountShell>;
}
