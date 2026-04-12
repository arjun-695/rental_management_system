import { requireRole } from "@/lib/auth-guard";
import { LayoutDashboard, Key, CalendarClock } from "lucide-react";
import AnimatedBackground from "@/components/landing/animated-background";

export default async function TenantPage(): Promise<any> {
  const session = await requireRole(["TENANT"]);

  return (
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 animate-fade-in-up">
        
        <header className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {session.user.name}</h1>
            <p className="text-muted-foreground mt-1">Manage your viewings and bookings</p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Active Rentals</h3>
            <p className="mt-1 text-sm text-muted-foreground">You currently have no active rental properties.</p>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <CalendarClock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Upcoming Browsings</h3>
            <p className="mt-1 text-sm text-muted-foreground">Find properties to book visits directly.</p>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-indigo-500/5 md:col-span-1 border-indigo-500/20">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Browse Properties</h3>
            <p className="mt-1 text-sm text-muted-foreground">Search to find your next home.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
