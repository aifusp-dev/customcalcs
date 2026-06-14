"use client";

import { useActionState } from "react";
import { setMyDisplayName } from "@/app/actions/members";

export function DisplayNameForm({
  calculatorId,
  displayName,
}: {
  calculatorId: string;
  displayName: string | null;
}) {
  const action = setMyDisplayName.bind(null, calculatorId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <label htmlFor="displayName" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Nombre para esta calculadora
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={40}
          placeholder="p. ej. Caja 1"
          defaultValue={displayName ?? ""}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {state?.errors?.displayName && (
          <p className="text-xs text-red-400">{state.errors.displayName[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-neutral-400">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar nombre"}
      </button>
    </form>
  );
}
