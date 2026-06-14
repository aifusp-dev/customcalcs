"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/google-button";

function GoogleError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "google") return null;

  return (
    <p className="text-sm text-red-400 text-center">
      No se pudo iniciar sesión con Google. Inténtalo de nuevo.
    </p>
  );
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">CustomCalcs</h1>
          <p className="text-sm text-neutral-400">Inicia sesión en tu cuenta</p>
        </div>

        <Suspense fallback={null}>
          <GoogleError />
        </Suspense>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
            />
            {state?.errors?.email && (
              <p className="text-xs text-red-400">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
            />
            {state?.errors?.password && (
              <p className="text-xs text-red-400">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-red-400">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs text-neutral-500 uppercase tracking-wide">o</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        <GoogleSignInButton />

        <p className="text-center text-sm text-neutral-400">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-white font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
