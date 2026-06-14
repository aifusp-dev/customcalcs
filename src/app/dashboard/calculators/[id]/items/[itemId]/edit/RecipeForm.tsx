"use client";

import { useState } from "react";
import { setItemRecipe } from "@/app/actions/recipes";

export function RecipeForm({
  calculatorId,
  itemId,
  items,
  recipe,
}: {
  calculatorId: string;
  itemId: string;
  items: { id: string; name: string; category: string | null }[];
  recipe: Record<string, number>;
}) {
  const [saved, setSaved] = useState(false);
  const action = setItemRecipe.bind(null, calculatorId, itemId);

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Necesitas otros productos en esta calculadora para poder definir una receta.
      </p>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }}
      className="space-y-4"
    >
      <ul className="space-y-2">
        {items.map((other) => (
          <li key={other.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{other.name}</p>
              {other.category && (
                <p className="text-xs text-neutral-400 truncate">{other.category}</p>
              )}
            </div>
            <input
              type="number"
              name={`ingredient-${other.id}`}
              min="0"
              step="1"
              defaultValue={recipe[other.id] ?? 0}
              className="w-20 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="border border-neutral-800 rounded-lg px-4 py-2.5 text-sm hover:bg-neutral-900 transition-colors"
        >
          Guardar receta
        </button>
        {saved && <p className="text-xs text-green-400">Guardado</p>}
      </div>
    </form>
  );
}
