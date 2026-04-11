import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";

export default async function DashboardRouterPage(): Promise<never> {
  const session = await requireAuth();

  if (session.user.role === "OWNER") redirect("/owner");
  if (session.user.role === "ADMIN") redirect("/admin");
  redirect("/tenant");
}
