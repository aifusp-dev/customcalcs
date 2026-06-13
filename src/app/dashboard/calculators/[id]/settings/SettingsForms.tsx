"use client";

import { useActionState } from "react";
import {
  updateCalculator,
  deleteCalculator,
} from "@/app/actions/calculators";

export function UpdateCalculatorForm({
  calculatorId,
  name,
}: {
  calculatorId: string;
  name: string;
}) {
  const action = updateCalculator.bind(null, calculatorId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Nombre de la calculadora
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={name}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-400">{state.errors.name[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-neutral-400">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-white text-black font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}

export function DeleteCalculatorForm({ calculatorId }: { calculatorId: string }) {
  return (
    <form action={deleteCalculator.bind(null, calculatorId)}>
      <button
        type="submit"
        className="border border-red-900 text-red-400 rounded-lg px-4 py-2.5 text-sm hover:bg-red-950/40 transition-colors"
      >
        Eliminar calculadora
      </button>
    </form>
  );
}
