"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { LogIn, Mail, Lock } from "lucide-react";

export default function SignInForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (!result || result.error || !result.ok) {
      setError("Invalid credentials or temporary lockout after repeated attempts.");
      return;
    }

    window.location.href = result.url ?? "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="glass-card flex w-full flex-col gap-5 rounded-2xl p-8 shadow-2xl shadow-indigo-500/10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <button
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40"
        type="submit"
      >
        Sign in
      </button>

      <div className="relative flex items-center justify-center text-sm my-2">
        <span className="bg-transparent px-2 text-muted-foreground">Or</span>
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-white/5 py-2.5 text-sm font-medium transition-all hover:border-white/20 hover:bg-white/10"
        type="button"
        onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.25024 6.65L5.26524 9.765C6.22524 6.725 9.06528 4.75 12.0003 4.75Z" fill="#EA4335" />
          <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.08 21.2C22.42 19.05 23.49 15.93 23.49 12.275Z" fill="#4285F4" />
          <path d="M5.26498 14.235C5.02498 13.505 4.88501 12.72 4.88501 11.91C4.88501 11.1 5.01998 10.315 5.26498 9.585L1.23499 6.47C0.464987 8.01 -0.00500488 9.77 -0.00500488 11.91C-0.00500488 14.05 0.464987 15.81 1.23499 17.35L5.26498 14.235Z" fill="#FBBC05" />
          <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 20.995L15.9154 17.885C14.8554 18.595 13.5454 19.045 12.0004 19.045C9.05035 19.045 6.22035 17.07 5.26035 14.03L1.23035 17.14C3.24035 21.1 7.30035 24 12.0004 24Z" fill="#34A853" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        New user?{" "}
        <Link href="/sign-up" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}