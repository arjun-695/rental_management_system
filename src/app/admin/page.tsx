import SignOutButton from "@/components/ui/auth/sign-out-button";
import { requireRole } from "@/lib/auth-guard";

export default async function AdminPage(): Promise<any> {
  const session = await requireRole(["ADMIN"]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Control Panel</h1>
        <SignOutButton />
      </div>
      <p>Welcome, {session.user.name}</p>
    </main>
  );
}