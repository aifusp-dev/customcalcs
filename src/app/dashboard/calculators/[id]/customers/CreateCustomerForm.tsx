"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCustomer } from "@/app/actions/customers";

export function CreateCustomerForm({ calculatorId }: { calculatorId: string }) {
  const action = createCustomer.bind(null, calculatorId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const handledState = useRef(state);

  useEffect(() => {
    if (state !== handledState.current) {
      handledState.current = state;
      if (!state?.errors && !state?.message) {
        formRef.current?.reset();
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 max-w-sm">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={60}
          placeholder="p. ej. Juan Pérez"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-400">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="Notas sobre este cliente..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors resize-y"
        />
        {state?.errors?.notes && (
          <p className="text-xs text-red-400">{state.errors.notes[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear cliente"}
      </button>

      {state?.message && (
        <p className="text-sm text-neutral-400">{state.message}</p>
      )}
    </form>
  );
}
