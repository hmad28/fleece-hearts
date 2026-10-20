import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountAddress } from "@/components/account/account-address";
import { VerifyEmail } from "@/components/account/verify-email";
import { auth } from "@/lib/auth/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Akun Saya" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth");
  const [count, admin] = await Promise.all([
    getDb().query<{ count: string }>("SELECT count(*)::text AS count FROM demo_orders WHERE customer_user_id=$1", [data.user.id]),
    getAdminUser(),
  ]);
  return <>{!data.user.emailVerified && <VerifyEmail email={data.user.email} />}<div className="mx-auto grid max-w-2xl gap-3 px-4 pt-12 sm:grid-cols-2"><Link href="/account/orders" className="rounded-2xl border border-line p-5 hover:bg-mist"><strong className="block text-xl">Pesanan saya</strong><span className="text-sm text-stone">{count.rows[0]?.count ?? "0"} pesanan · detail dan status</span></Link><Link href="/account/chat" className="rounded-2xl border border-line p-5 hover:bg-mist"><strong className="block text-xl">Chat dengan admin</strong><span className="text-sm text-stone">Tanya produk atau pesanan</span></Link>{admin && <Link href="/admin" className="rounded-2xl border border-line p-5 hover:bg-mist"><strong className="block text-xl">Dashboard admin</strong><span className="text-sm text-stone">Kelola toko</span></Link>}</div><AccountAddress name={data.user.name} email={data.user.email} /></>;
}
