import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import type { AppRole } from "@/types/next-auth";

const ROLE_HOME: Record<AppRole, string> = {
  ADMIN: "/admin",
  OWNER: "/owner",
  TENANT: "/tenant",
};

function roleHome(role: AppRole): string {
  return ROLE_HOME[role];
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession(authOptions);
  // if session has expired or user is not authorized, redirect to sign-in page
  if (!session?.user) redirect("/sign-in");
  return session;
}

export async function requireRole(allowed: readonly AppRole[]): Promise<Session> {
  const session = await requireAuth();
  // if user is not in the allowed roles, redirect to their home page
  if (!allowed.includes(session.user.role)) {
    redirect(roleHome(session.user.role));
  }
  // if user is authorized, return the session
  return session;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const session = await getServerSession(authOptions);
  // if session has expired or user is not authorized, redirect to sign-in page
  if (!session?.user) return;
  // if user is authorized, redirect to their home page
  redirect(roleHome(session.user.role));
}