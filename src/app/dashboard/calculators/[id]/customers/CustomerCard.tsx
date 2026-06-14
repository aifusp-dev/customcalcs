"use client";

import { useActionState } from "react";
import { updateCustomer, deleteCustomer } from "@/app/actions/customers";

export function CustomerCard({
  calculatorId,
  customer,
}: {
  calculatorId: string;
  customer: { id: string; name: string; notes: string | null };
}) {
  const action = updateCustomer.bind(null, calculatorId, customer.id);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <li className="border border-neutral-800 rounded-lg p-4 space-y-3">
      <form action={formAction} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Nombre
          </label>
          <input
            name="name"
            type="text"
            required
            maxLength={60}
            defaultValue={customer.name}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
          />
          {state?.errors?.name && (
            <p className="text-xs text-red-400">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Notas
          </label>
          <textarea
            name="notes"
            rows={3}
            maxLength={2000}
            defaultValue={customer.notes ?? ""}
            placeholder="Notas sobre este cliente..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors resize-y"
          />
          {state?.errors?.notes && (
            <p className="text-xs text-red-400">{state.errors.notes[0]}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar"}
          </button>
          {state?.message && (
            <p className="text-sm text-neutral-400">{state.message}</p>
          )}
        </div>
      </form>

      <form
        action={async () => {
          await deleteCustomer(calculatorId, customer.id);
        }}
      >
        <button
          type="submit"
          className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 text-red-400 hover:bg-neutral-900 transition-colors"
        >
          Eliminar cliente
        </button>
      </form>
    </li>
  );
}
