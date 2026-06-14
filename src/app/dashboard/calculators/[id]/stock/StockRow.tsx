"use client";

import { useState } from "react";
import { setItemStock } from "@/app/actions/items";

export default function StockRow({
  calculatorId,
  item,
}: {
  calculatorId: string;
  item: { id: string; name: string; category: string | null; stock: number };
}) {
  const [saved, setSaved] = useState(false);
  const action = setItemStock.bind(null, calculatorId, item.id);

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
    </li>
  );
}
