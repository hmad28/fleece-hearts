import { redirect } from "next/navigation";
import { StaffManager } from "@/components/admin/staff-manager";
import { getAdminUser } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

type Staff = { email: string; role: "OWNER" | "ADMIN"; user_id: string | null; created_at: string };

export default async function StaffPage() {
  const user = await getAdminUser();
  if (user?.adminRole !== "OWNER") redirect("/admin");
  const { rows } = await getDb().query<Staff>("SELECT email,role,user_id,created_at FROM admin_staff ORDER BY created_at");
  return <StaffManager initial={rows} currentEmail={user.email} />;
}
