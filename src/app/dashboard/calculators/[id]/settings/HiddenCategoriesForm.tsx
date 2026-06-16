"use client";

import { useActionState } from "react";
import { updateHiddenCategories } from "@/app/actions/calculators";

export function HiddenCategoriesForm({
  calculatorId,
  categories,
  hiddenCategories,
}: {
  calculatorId: string;
  categories: string[];
  hiddenCategories: string[];
}) {
  const action = updateHiddenCategories.bind(null, calculatorId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3 max-w-sm">
      <ul className="space-y-2">
        {categories.map((cat) => {
          const isHidden = hiddenCategories.includes(cat);
          return (
            <li key={cat} className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                <input
                  type="checkbox"
                  name="hiddenCategory"
                  value={cat}
                  defaultChecked={isHidden}
                  className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 accent-[var(--accent)]"
                />
                <span className="text-sm">{cat}</span>
              </label>
              {isHidden && (
                <span className="text-xs text-neutral-500">Oculta</span>
              )}
            </li>
          );
        })}
      </ul>

      {state?.message && (
        <p className="text-sm text-neutral-400">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar visibilidad"}
      </button>
    </form>
  );
}
