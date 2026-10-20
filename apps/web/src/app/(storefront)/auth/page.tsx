import type { Metadata } from "next";
import { AuthForm } from "@/components/account/auth-form";

export const metadata: Metadata = { title: "Masuk atau Daftar" };

export default function AuthPage() {
  return <AuthForm />;
}
