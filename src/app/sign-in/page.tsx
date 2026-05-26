import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col px-6 pt-16 pb-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <div className="mt-10">
        <h1 className="font-serif text-3xl font-medium text-foreground">Welcome</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in or create an account to get started.
        </p>
      </div>
      <div className="mt-8">
        <SignInForm />
      </div>
    </main>
  );
}
