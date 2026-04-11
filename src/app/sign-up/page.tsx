import { redirectIfAuthenticated } from "@/lib/auth-guard";
import SignUpForm from "@/components/ui/auth/sign-up-form";

export default async function SignUpPage(): Promise<any> {
  await redirectIfAuthenticated();

  return (
    <main className="mx-auto flex min-h-screen items-center justify-center p-8">
      <SignUpForm />
    </main>
  );
}
