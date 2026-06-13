"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCalculator } from "@/app/actions/calculators";

export default function NewCalculatorPage() {
  const [state, action, pending] = useActionState(createCalculator, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Nueva calculadora</h1>
          <p className="text-sm text-neutral-400">
            Dale un nombre a tu calculadora de precios.
          </p>
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
              placeholder="Ej. Bar La Esquina"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
            />
            {state?.errors?.name && (
              <p className="text-xs text-red-400">{state.errors.name[0]}</p>
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
            {pending ? "Creando..." : "Crear calculadora"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400">
          <Link href="/dashboard" className="text-white font-medium hover:underline">
            Volver al panel
          </Link>
        </p>
      </div>
    </div>
  );
}
