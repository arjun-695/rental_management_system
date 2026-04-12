import { requireRole } from "@/lib/auth-guard";
import { Building2, PlusCircle, Users } from "lucide-react";
import AnimatedBackground from "@/components/landing/animated-background";
import Link from "next/link";

export default async function OwnerPage(): Promise<any> {
  const session = await requireRole(["OWNER"]);

  return (
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 animate-fade-in-up">
        
        <header className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Owner Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}</p>
          </div>
          <Link
            href="/owner/properties/new" 
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40"
          >
            <PlusCircle className="h-4 w-4" />
            Add Property
          </Link>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-emerald-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">My Properties</h3>
            <p className="mt-1 text-sm text-muted-foreground">Manage your existing property listings.</p>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-teal-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Booking Requests</h3>
            <p className="mt-1 text-sm text-muted-foreground">View and approve tenant requests.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
