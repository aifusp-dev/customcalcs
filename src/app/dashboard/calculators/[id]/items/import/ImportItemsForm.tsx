"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { parseItemsWithAI, importItemsBulk } from "@/app/actions/items";

type Row = {
  name: string;
  category: string;
  price: string;
  stock: string;
};

const EXAMPLE_TEXT = `COMIDA
CARNE DE RES: 50
QUESO CON PAVO: 55
TARTA DE QUESO: 65

BEBIDAS SIN ALCOHOL
AGUA: 30
AGUA CON GAS: 50
ZUMO DE NARANJA: 50`;

export function ImportItemsForm({ calculatorId }: { calculatorId: string }) {
  const parseAction = parseItemsWithAI.bind(null, calculatorId);
  const importAction = importItemsBulk.bind(null, calculatorId);

  const [parseState, parseFormAction, parsePending] = useActionState(parseAction, undefined);
  const [importState, importFormAction, importPending] = useActionState(importAction, undefined);

  const [rows, setRows] = useState<Row[]>([]);
  const [syncedState, setSyncedState] = useState(parseState);

  if (parseState !== syncedState) {
    setSyncedState(parseState);
    if (parseState?.items) {
      setRows(
        parseState.items.map((item) => ({
          name: item.name,
          category: item.category ?? "",
          price: String(item.price),
          stock: String(item.stock ?? 0),
        }))
      );
    }
  }

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [...prev, { name: "", category: "", price: "0", stock: "0" }]);
  }

  const itemsJson = JSON.stringify(
    rows.map((row) => ({
      name: row.name,
      category: row.category || null,
      price: Number(row.price),
      stock: Number(row.stock),
    }))
  );

  return (
    <div className="space-y-8">
      <form action={parseFormAction} className="space-y-3 max-w-2xl">
        <label htmlFor="text" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Texto con productos
        </label>
        <textarea
          id="text"
          name="text"
          rows={12}
          required
          placeholder={EXAMPLE_TEXT}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors font-mono"
        />

        {parseState?.message && <p className="text-sm text-red-400">{parseState.message}</p>}

        <button
          type="submit"
          disabled={parsePending}
          className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {parsePending ? "Generando..." : "Generar con IA"}
        </button>
      </form>

      {!!parseState?.skipped && (
        <p className="text-sm text-yellow-400">
          Se omitieron {parseState.skipped} línea(s) sin precio reconocible (p. ej. packs o
          combos). Puedes añadirlas manualmente abajo.
        </p>
      )}

      {rows.length > 0 && (
        <form action={importFormAction} className="space-y-4">
          <input type="hidden" name="items" value={itemsJson} />

          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Categoría</th>
                  <th className="px-3 py-2 text-left">Precio (€)</th>
                  <th className="px-3 py-2 text-left">Stock</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t border-neutral-800">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(index, "name", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.category}
                        onChange={(e) => updateRow(index, "category", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.price}
                        onChange={(e) => updateRow(index, "price", e.target.value)}
                        className="w-24 bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={row.stock}
                        onChange={(e) => updateRow(index, "stock", e.target.value)}
                        className="w-20 bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importState?.message && <p className="text-sm text-red-400">{importState.message}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={addRow}
              className="border border-neutral-800 rounded-lg px-4 py-2.5 text-sm hover:bg-neutral-900 transition-colors"
            >
              Añadir fila
            </button>
            <button
              type="submit"
              disabled={importPending || rows.length === 0}
              className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {importPending ? "Importando..." : `Importar ${rows.length} producto(s)`}
            </button>
            <Link
              href={`/dashboard/calculators/${calculatorId}`}
              className="border border-neutral-800 rounded-lg px-4 py-2.5 text-sm hover:bg-neutral-900 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
