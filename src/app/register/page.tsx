"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/google-button";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Image
            src="/logo.png"
            alt="CustomCalcs"
            width={56}
            height={56}
            className="mx-auto rounded-xl"
          />
          <h1 className="text-2xl font-bold tracking-tight">CustomCalcs</h1>
          <p className="text-sm text-neutral-400">Crea tu cuenta</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
            />
            {state?.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

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
              <ul className="text-xs text-red-400 space-y-0.5">
                {state.errors.password.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
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
            {pending ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs text-neutral-500 uppercase tracking-wide">o</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        <GoogleSignInButton />

        <p className="text-center text-sm text-neutral-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-white font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
