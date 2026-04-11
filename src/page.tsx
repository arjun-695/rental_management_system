import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage(): Promise<any> {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">Rental Management System</h1>

      {session?.user ? (
        <>
          <p>
            Signed in as <span className="font-semibold">{session.user.name}</span>
          </p>
          <Link className="underline" href="/dashboard">
            Go to dashboard
          </Link>
        </>
      ) : (
        <div className="flex gap-4">
          <Link className="underline" href="/sign-in">
            Sign in
          </Link>
          <Link className="underline" href="/sign-up">
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}