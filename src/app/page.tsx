import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { JSX } from "react";

export default async function HomePage(): Promise<any> {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Rental Management System</h1>

      {session?.user ? (
        <>
          <p>
            Signed in as <span className="font-semibold">{session.user.name}</span> (
            {session.user.role})
          </p>
          <Link className="underline" href="/dashboard">
            Go to dashboard
          </Link>
        </>
      ) : (
        <div className="flex gap-4">
          <Link className="underline" href="/sign-in">Sign in</Link>
          <Link className="underline" href="/sign-up">Sign up</Link>
        </div>
      )}
    </main>
  );
}
