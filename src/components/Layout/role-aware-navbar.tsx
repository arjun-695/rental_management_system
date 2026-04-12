import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import SignOutButton from "@/components/auth/sign-out-button";
import type { AppRole } from "@/types/next-auth";
import { Home } from "lucide-react";

// ─── Per-role navigation links ───────────────────────────────
type NavLink = { href: string; label: string };

const NAV_LINKS: Record<AppRole, NavLink[]> = {
  OWNER: [
    { href: "/owner", label: "Dashboard" },
    { href: "/owner/properties/new", label: "Add Property" },
    { href: "/properties", label: "All Listings" },
  ],
  ADMIN: [
    { href: "/admin", label: "Admin Panel" },
    { href: "/properties", label: "All Listings" },
  ],
  TENANT: [
    { href: "/tenant", label: "Dashboard" },
    { href: "/properties", label: "Browse" },
    { href: "/tenant/booking", label: "My Bookings" },
  ],
};

const ROLE_COLORS: Record<AppRole, string> = {
  ADMIN: "from-rose-500 to-orange-500",
  OWNER: "from-emerald-500 to-teal-500",
  TENANT: "from-indigo-500 to-violet-500",
};

// ─── Component ───────────────────────────────────────────────
export default async function RoleAwareNavbar() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Home className="h-5 w-5 text-indigo-500" />
            <span>RentEase</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg border border-border/50 px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-500/10"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  const { role, name } = session.user;
  const links = NAV_LINKS[role] ?? NAV_LINKS.TENANT;
  const gradient = ROLE_COLORS[role] ?? ROLE_COLORS.TENANT;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Home className="h-5 w-5 text-indigo-500" />
          <span>RentEase</span>
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full bg-gradient-to-r ${gradient} px-3 py-1 text-xs font-semibold text-white`}>
            {name} · {role}
          </span>
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
