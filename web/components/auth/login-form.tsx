"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      setError("");

      const result = await signIn("credentials", {
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Password incorrect or auth environment is not configured.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Admin password</span>
        <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
          <LockKeyhole className="size-4 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit();
              }
            }}
            placeholder="Enter admin password"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </label>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button
        type="button"
        onClick={submit}
        disabled={isPending || password.length === 0}
        className="h-11 w-full rounded-full"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </div>
  );
}
