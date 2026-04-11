"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

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
      callbackUrl: "/dashboard", // after successful sign in, redirect to dashboard
    });

    if (!result || result.error || !result.ok) {
      setError("Invalid credentials or temporary lockout after repeated attempts.");
      return;
    }

    // if sign in is successful, redirect to dashboard
    window.location.href = result.url ?? "/dashboard";
  }

  return (

    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 rounded border p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>

      <input
        className="rounded border p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <input
        className="rounded border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <button className="rounded bg-black p-2 text-white" type="submit">
        Sign in with email
      </button>

      <button
        className="rounded border p-2"
        type="button"
        onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
      > Continue with Google </button> 

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <p className="text-sm">
        New user?{" "}
        <Link href="/sign-up" className="underline">
          Create account
        </Link>
      </p>
    </form>
  );
}