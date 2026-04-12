import { redirectIfAuthenticated } from "@/lib/auth-guard"

import SignInForm from "@/components/ui/auth/sign-in-form";

export default async function SignInPage(): Promise<any> {
  await redirectIfAuthenticated();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center p-6">
      <SignInForm />
    </main>
  );
}