"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { loginAction, type LoginActionState } from "@/app/login/actions";

const initialState: LoginActionState = { error: null };

export function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string;
  initialError?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = state.error ?? initialError ?? null;

  return (
    <form action={formAction} method="POST" className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-300 bg-red-50 p-3.5 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Alamat Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          spellCheck={false}
          enterKeyHint="next"
          required
          placeholder="nama@domain.com"
          className="min-h-12 w-full rounded-lg border border-input-border bg-background px-3.5 text-base text-foreground placeholder:text-muted"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Kata Sandi <span aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            enterKeyHint="done"
            required
            placeholder="Masukkan kata sandi"
            className="min-h-12 w-full rounded-lg border border-input-border bg-background py-2.5 pr-12 pl-3.5 text-base text-foreground placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
            aria-label={
              showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
            }
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-5 text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        <span>{isPending ? "Memproses..." : "Masuk ke Dashboard"}</span>
      </button>
    </form>
  );
}
