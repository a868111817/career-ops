import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8f0db_0%,_#f2e7ce_45%,_#efe2c9_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(83,61,24,0.12)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Admin sign-in</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-slate-950">
          NextAuth credentials access
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          This project now uses a single-password admin gate backed by NextAuth credentials and `ADMIN_PASSWORD_HASH`.
        </p>

        <div className="mt-8 rounded-[1.3rem] border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500">
          Required env vars: `NEXTAUTH_SECRET`, `ADMIN_PASSWORD_HASH`
        </div>

        <LoginForm />

        <Link
          href="/"
          className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
