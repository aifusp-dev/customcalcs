"use client";

import { useState } from "react";
import { setItemStock } from "@/app/actions/items";
import { craftItem } from "@/app/actions/recipes";

export default function StockRow({
  calculatorId,
  item,
}: {
  calculatorId: string;
  item: {
    id: string;
    name: string;
    category: string | null;
    stock: number;
    recipe: { name: string; quantity: number; stock: number }[];
  };
}) {
  const [saved, setSaved] = useState(false);
  const [craftError, setCraftError] = useState<string | null>(null);
  const action = setItemStock.bind(null, calculatorId, item.id);
  const craftAction = craftItem.bind(null, calculatorId, item.id);

  const maxCraftable =
    item.recipe.length > 0
      ? Math.min(...item.recipe.map((ing) => Math.floor(ing.stock / ing.quantity)))
      : 0;

  return (
    <li className="border border-neutral-800 rounded-lg px-3 py-2 space-y-2">
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        {item.category && (
          <p className="text-xs text-neutral-400 truncate">{item.category}</p>
        )}
      </div>

      <form
        action={async (formData) => {
          await action(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="number"
          name="stock"
          step="1"
          min="0"
          defaultValue={item.stock}
          className="w-full min-w-0 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        <button
          type="submit"
          className="text-sm border border-neutral-800 rounded-lg px-2 py-1.5 hover:bg-neutral-900 transition-colors whitespace-nowrap"
        >
          Guardar
        </button>
      </form>
      {saved && <p className="text-xs text-green-400">Guardado</p>}

      {item.recipe.length > 0 && (
        <div className="border-t border-neutral-800 pt-2 space-y-1.5">
          <p className="text-xs text-neutral-400">
            Receta: {item.recipe.map((ing) => `${ing.quantity}x ${ing.name}`).join(", ")}
          </p>
          <p className="text-xs text-neutral-400">Se pueden fabricar: {maxCraftable}</p>
          <form
            action={async (formData) => {
              setCraftError(null);
              try {
                await craftAction(formData);
              } catch (error) {
                setCraftError(error instanceof Error ? error.message : "Error al fabricar.");
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="number"
              name="quantity"
              step="1"
              min="1"
              defaultValue={1}
              className="w-full min-w-0 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
            />
            <button
              type="submit"
              disabled={maxCraftable < 1}
              className="text-sm border border-neutral-800 rounded-lg px-2 py-1.5 hover:bg-neutral-900 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              Fabricar
            </button>
          </form>
          {craftError && <p className="text-xs text-red-400">{craftError}</p>}
        </div>
      )}
    </li>
  );
}
