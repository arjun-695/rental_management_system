"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserPlus, User, Calendar, Mail, Lock, Shield } from "lucide-react";

type SignupFieldErrors = Partial<
  Record<"name" | "age" | "email" | "role" | "password", string[]>
>;

type SignupApiResponse =
  | { ok: true; message: string }
  | {
      ok: false;
      code: "INVALID_INPUT" | "RATE_LIMITED" | "INTERNAL_ERROR" | "EMAIL_ALREADY_EXISTS";
      message: string;
      retryAfterSeconds?: number;
      fieldErrors?: SignupFieldErrors;
    };

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [role, setRole] = useState<"TENANT" | "OWNER">("TENANT");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: Number(age),
        email,
        role,
        password,
      }),
    });

    const body = (await response.json()) as SignupApiResponse;

    if (body.ok) {
      router.push(`/sign-in?registered=1&email=${encodeURIComponent(email)}`);
      return;
    }

    if (body.fieldErrors) {
      setFieldErrors(body.fieldErrors);
    }

    setMessage(body.message);

    if (response.status === 201 && body.ok) {
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (login?.ok) {
        window.location.href = login.url ?? "/dashboard";
      }
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-card flex w-full flex-col gap-4 rounded-2xl p-8 shadow-2xl shadow-indigo-500/10"
    >
      <div className="text-center mb-2">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <UserPlus className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join RentEase to get started</p>
      </div>

      {message && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className={`w-full rounded-xl border ${fieldErrors.name ? 'border-red-500' : 'border-border/50'} bg-background/50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          {fieldErrors.name?.[0] && <p className="text-[10px] text-red-400 ml-1">{fieldErrors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Age</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className={`w-full rounded-xl border ${fieldErrors.age ? 'border-red-500' : 'border-border/50'} bg-background/50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
              type="number"
              placeholder="25"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              required
            />
          </div>
          {fieldErrors.age?.[0] && <p className="text-[10px] text-red-400 ml-1">{fieldErrors.age[0]}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className={`w-full rounded-xl border ${fieldErrors.email ? 'border-red-500' : 'border-border/50'} bg-background/50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        {fieldErrors.email?.[0] && <p className="text-[10px] text-red-400 ml-1">{fieldErrors.email[0]}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Role</label>
        <div className="relative">
          <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <select
            className={`w-full rounded-xl border ${fieldErrors.role ? 'border-red-500' : 'border-border/50'} bg-background/50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none`}
            value={role}
            onChange={(event) => setRole(event.target.value as "TENANT" | "OWNER")}
            required
          >
            <option value="TENANT">Tenant (Looking to rent)</option>
            <option value="OWNER">Owner (Want to list properties)</option>
          </select>
        </div>
        {fieldErrors.role?.[0] && <p className="text-[10px] text-red-400 ml-1">{fieldErrors.role[0]}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className={`w-full rounded-xl border ${fieldErrors.password ? 'border-red-500' : 'border-border/50'} bg-background/50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {fieldErrors.password?.[0] && <p className="text-[10px] text-red-400 ml-1">{fieldErrors.password[0]}</p>}
      </div>

      <button
        className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40"
        type="submit"
      >
        Create account
      </button>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
