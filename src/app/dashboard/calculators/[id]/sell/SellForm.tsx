"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { createSale } from "@/app/actions/sales";
import { formatPrice } from "@/lib/format";

type Item = {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string | null;
  imageUrl: string | null;
};

export default function SellForm({
  calculatorId,
  items,
}: {
  calculatorId: string;
  items: Item[];
}) {
  const action = createSale.bind(null, calculatorId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [resetKey, setResetKey] = useState(0);
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) {
      setQuantities({});
      setResetKey((key) => key + 1);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * (quantities[item.id] ?? 0),
    0
  );

  return (
    <form action={formAction} className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Todavía no hay productos en esta calculadora.
        </p>
      ) : (
        <ul key={resetKey} className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 border border-neutral-800 rounded-lg px-4 py-3"
            >
              <div className="h-12 w-12 flex-shrink-0 rounded-md bg-neutral-900 overflow-hidden flex items-center justify-center">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-neutral-600">Sin foto</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-neutral-400">
                  {formatPrice(item.price)} · Stock: {item.stock}
                </p>
              </div>

              <input
                type="number"
                name={`quantity-${item.id}`}
                min={0}
                max={item.stock}
                step={1}
                defaultValue={0}
                disabled={item.stock === 0}
                onChange={(event) =>
                  setQuantities((current) => ({
                    ...current,
                    [item.id]: Number(event.target.value),
                  }))
                }
                className="w-20 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors disabled:opacity-40"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
        <p className="text-lg font-semibold">Total: {formatPrice(total)}</p>
        <button
          type="submit"
          disabled={pending || items.length === 0}
          className="bg-white text-black font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Registrando..." : "Registrar venta"}
        </button>
      </div>

      {state?.message && (
        <p className={`text-sm ${state.success ? "text-green-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
