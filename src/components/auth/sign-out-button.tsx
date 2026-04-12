"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-500"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}