import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import SignOutButton from "@/components/ui/auth/sign-out-button";
import type { AppRole } from "@/types/next-auth";

// ─── Per-role navigation links ───────────────────────────────
type NavLink = { href: string; label: string };

const NAV_LINKS: Record<AppRole, NavLink[]> = {
  OWNER: [
    { href: "/owner", label: "Owner Dashboard" },
    { href: "/owner/properties/new", label: "Add Property" },
    { href: "/properties", label: "All Listings" },
  ],
  ADMIN: [
    { href: "/admin", label: "Admin Panel" },
    { href: "/properties", label: "All Listings" },
  ],
  TENANT: [
    { href: "/tenant", label: "Tenant Dashboard" },
    { href: "/properties", label: "Browse Properties" },
  ],
};

// ─── Component ───────────────────────────────────────────────
export default async function RoleAwareNavbar() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <header className="border-b">
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            Rental Management System
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm underline">
              Sign in
            </Link>
            <Link href="/sign-up" className="text-sm underline">
              Sign up
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  const { role, name } = session.user;
  const links = NAV_LINKS[role] ?? NAV_LINKS.TENANT;

  return (
    <header className="border-b">
      <nav className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link href="/" className="font-semibold">
          Rental Management System
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded border px-2 py-1 text-xs">
            {name} ({role})
          </span>
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
