"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function SwitchRoleButton({ targetRole }: { targetRole: "TENANT" | "OWNER" }) {
  const { update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSwitch() {
    setIsLoading(true);
    try {
      // 1. Update database
      const res = await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to update role");
      }

      // 2. Refresh JWT session token
      await update({ role: targetRole });

      // 3. Redirect to the core dashboard
      router.push(`/${targetRole.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isLoading}
      className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 ${
        targetRole === "OWNER" 
          ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40"
          : "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-indigo-500/25 hover:shadow-indigo-500/40"
      }`}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      Switch to {targetRole === "OWNER" ? "Owner Mode" : "Tenant Mode"}
    </button>
  );
}
