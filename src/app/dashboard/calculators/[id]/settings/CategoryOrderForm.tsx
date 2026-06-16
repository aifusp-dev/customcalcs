"use client";

import { useActionState, useState } from "react";
import { updateCategoryOrder } from "@/app/actions/calculators";

export function CategoryOrderForm({
  calculatorId,
  categories,
}: {
  calculatorId: string;
  categories: string[];
}) {
  const action = updateCategoryOrder.bind(null, calculatorId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [order, setOrder] = useState(categories);

  function move(index: number, dir: -1 | 1) {
    setOrder((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-3 max-w-sm">
      <ul className="space-y-1.5">
        {order.map((cat, i) => (
          <li key={cat} className="flex items-center gap-2">
            <span className="flex-1 text-sm border border-neutral-800 rounded-lg px-3 py-2 bg-neutral-900 truncate">
              {cat}
            </span>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label="Subir"
              className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-base leading-none"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === order.length - 1}
              aria-label="Bajar"
              className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-base leading-none"
            >
              ↓
            </button>
          </li>
        ))}
      </ul>

      <input type="hidden" name="categoryOrder" value={JSON.stringify(order)} />

      {state?.message && (
        <p className="text-sm text-neutral-400">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar orden"}
      </button>
    </form>
  );
}
