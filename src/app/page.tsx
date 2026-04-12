import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import type { AppRole } from "@/types/next-auth";
import LandingContent from "@/components/landing/landing-content";

const ROLE_HOME: Record<AppRole, string> = {
  ADMIN: "/admin",
  OWNER: "/owner",
  TENANT: "/tenant",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Authenticated users go straight to their dashboard
  if (session?.user) {
    const role: AppRole = session.user.role ?? "TENANT";
    redirect(ROLE_HOME[role]);
  }

  return (
    <div className="dark">
      <LandingContent />
    </div>
  );
}
