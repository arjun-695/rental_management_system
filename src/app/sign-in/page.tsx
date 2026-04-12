import { redirectIfAuthenticated } from "@/lib/auth-guard";
import SignInForm from "@/components/auth/sign-in-form";
import AnimatedBackground from "@/components/landing/animated-background";

export default async function SignInPage(): Promise<any> {
  await redirectIfAuthenticated();

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6 dark">
      <AnimatedBackground />
      <div className="z-10 w-full max-w-md animate-fade-in-up">
        <SignInForm />
      </div>
    </main>
  );
}
