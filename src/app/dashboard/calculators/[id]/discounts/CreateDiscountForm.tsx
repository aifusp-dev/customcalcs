"use client";

import { useActionState, useRef, useEffect } from "react";
import { createDiscount } from "@/app/actions/discounts";

export function CreateDiscountForm({ calculatorId }: { calculatorId: string }) {
  const action = createDiscount.bind(null, calculatorId);
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
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 max-w-sm">
      <div className="flex-1 min-w-[10rem] space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={40}
          placeholder="p. ej. Black Friday"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-400">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="w-24 space-y-1.5">
        <label htmlFor="percentage" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          %
        </label>
        <input
          id="percentage"
          name="percentage"
          type="number"
          step="0.01"
          min="0.01"
          max="100"
          required
          placeholder="10"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {state?.errors?.percentage && (
          <p className="text-xs text-red-400">{state.errors.percentage[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear"}
      </button>

      {state?.message && (
        <p className="text-sm text-neutral-400 w-full">{state.message}</p>
      )}
    </form>
  );
}
