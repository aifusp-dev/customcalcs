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

function groupByCategory(items: Item[]): [string, Item[]][] {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const key = item.category?.trim() || "Sin categoría";
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return Array.from(groups.entries());
}

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
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) {
      setQuantities({});
    }
  }

  const adjustQuantity = (item: Item, delta: number) => {
    setQuantities((current) => {
      const next = Math.max(
        0,
        Math.min(item.stock, (current[item.id] ?? 0) + delta)
      );
      const updated = { ...current };
      if (next === 0) {
        delete updated[item.id];
      } else {
        updated[item.id] = next;
      }
      return updated;
    });
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * (quantities[item.id] ?? 0),
    0
  );
  const totalUnits = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const groups = groupByCategory(items);
  const showCategoryHeadings =
    groups.length > 1 || groups[0]?.[0] !== "Sin categoría";

  return (
    <form action={formAction} className="space-y-6 pb-28">
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Todavía no hay productos en esta calculadora.
        </p>
      ) : (
        groups.map(([category, groupItems]) => (
          <div key={category} className="space-y-2">
            {showCategoryHeadings && (
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                {category}
              </h3>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {groupItems.map((item) => {
                const quantity = quantities[item.id] ?? 0;
                const selected = quantity > 0;
                const outOfStock = item.stock === 0;

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col rounded-xl border bg-neutral-950 overflow-hidden transition-colors ${
                      selected ? "border-[var(--accent)]" : "border-neutral-800"
                    } ${outOfStock ? "opacity-40" : ""}`}
                  >
                    <input
                      type="hidden"
                      name={`quantity-${item.id}`}
                      value={quantity}
                    />

                    <div className="aspect-square w-full bg-neutral-900 flex items-center justify-center">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={160}
                          height={160}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-neutral-600">Sin foto</span>
                      )}
                    </div>

                    {selected && (
                      <span className="absolute top-1.5 right-1.5 h-6 min-w-6 px-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-bold flex items-center justify-center">
                        {quantity}
                      </span>
                    )}

                    <div className="p-2 space-y-1.5">
                      <p
                        className="text-sm font-medium leading-tight line-clamp-2"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatPrice(item.price)} · Stock: {item.stock}
                      </p>

                      <div className="flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => adjustQuantity(item, -1)}
                          disabled={quantity === 0}
                          aria-label={`Quitar una unidad de ${item.name}`}
                          className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-neutral-700 text-lg font-semibold disabled:opacity-30 active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                        >
                          −
                        </button>
                        <span
                          className="flex-1 text-center text-sm font-semibold tabular-nums"
                          aria-live="polite"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustQuantity(item, 1)}
                          disabled={outOfStock || quantity >= item.stock}
                          aria-label={`Añadir una unidad de ${item.name}`}
                          className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-lg font-semibold disabled:opacity-30 active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="w-full max-w-3xl mx-auto px-4 py-3 space-y-2">
          {state?.message && (
            <p
              className={`text-sm ${state.success ? "text-green-400" : "text-red-400"}`}
            >
              {state.message}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-neutral-400">
                {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
              </p>
              <p className="text-lg font-bold" aria-live="polite">
                {formatPrice(total)}
              </p>
            </div>
            <button
              type="submit"
              disabled={pending || totalUnits === 0}
              className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-6 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {pending ? "Registrando..." : "Registrar venta"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
