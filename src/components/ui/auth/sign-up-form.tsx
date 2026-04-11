"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

type SignupApiResponse =
  | { ok: true; message: string }
  | {
      ok: false;
      code: "INVALID_INPUT" | "RATE_LIMITED" | "INTERNAL_ERROR";
      message: string;
      retryAfterSeconds?: number;
    };

export default function SignUpForm() {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: Number(age),
        email,
        password,
      }),
    });

    const body = (await response.json()) as SignupApiResponse; // parse the response
    setMessage(body.message); // set the message

    // Auto-login only when a new account is actually created.
    if (response.status === 201 && body.ok) {
      // if the response is successful and the account is created
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (login?.ok) {
        window.location.href = login.url ?? "/dashboard"; // after successful sign in, redirect to dashboard
      }
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-3 rounded border p-6"
    >
      <h1 className="text-xl font-semibold">Create account</h1>
      <input
        className="rounded border p-2"
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <input
        className="rounded border p-2"
        type="number"
        placeholder="Age"
        value={age}
        onChange={(event) => setAge(event.target.value)}
        required
      />

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
        Create account
      </button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}

      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
