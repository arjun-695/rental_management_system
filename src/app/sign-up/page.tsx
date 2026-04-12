import { redirectIfAuthenticated } from "@/lib/auth-guard";
import SignUpForm from "@/components/auth/sign-up-form";

export default async function SignUpPage(): Promise<any> {
  await redirectIfAuthenticated();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center p-6">
      <SignUpForm />
    </main>
  );
}
