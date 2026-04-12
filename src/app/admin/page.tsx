import { requireRole } from "@/lib/auth-guard";
import { ShieldAlert, Database, BarChart3 } from "lucide-react";
import AnimatedBackground from "@/components/landing/animated-background";

export default async function AdminPage(): Promise<any> {
  const session = await requireRole(["ADMIN"]);

  return (
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 animate-fade-in-up">
        
        <header className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Control Panel</h1>
            <p className="text-muted-foreground mt-1">Logged in as {session.user.name}</p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-rose-500/5 border-rose-500/20">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <p className="mt-1 text-sm text-muted-foreground">Oversee all tenant and owner accounts.</p>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-rose-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">System Logs</h3>
            <p className="mt-1 text-sm text-muted-foreground">Monitor platform activity and errors.</p>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl shadow-orange-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Metrics</h3>
            <p className="mt-1 text-sm text-muted-foreground">View platform usage and statistics.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
