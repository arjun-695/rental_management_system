import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth-guard";
import type { AppRole } from "@/types/next-auth";

export default async function PropertiesNewAliasPage(): Promise<never> {
  const session = await requireAuth();
  const role = session.user.role as AppRole;

  if (role === "OWNER" || role === "ADMIN") {
    redirect("/owner/properties/new");
  }

  redirect("/properties");
}
