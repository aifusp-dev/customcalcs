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
    <li className="flex items-center gap-4 border border-neutral-800 rounded-lg px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
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
          className="w-24 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        <button
          type="submit"
          className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 hover:bg-neutral-900 transition-colors"
        >
          Guardar
        </button>
        {saved && <span className="text-xs text-green-400">Guardado</span>}
      </form>
    </li>
  );
}
