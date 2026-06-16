"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { parseLinkWithAI, applyLinking } from "@/app/actions/items";
import type { AILinkResult } from "@/lib/definitions";

type MateriaPrimaRow = {
  nombre: string;
  categoria: string;
  precio: string;
  stock: string;
};

type VinculoRow = {
  nombreEnInstruccion: string;
  nombreProducto: string;
  existente: boolean;
  precio: string;
  categoria: string;
  cantidad: string;
};

function toRows(result: AILinkResult): { mp: MateriaPrimaRow; vinculos: VinculoRow[] } {
  return {
    mp: {
      nombre: result.materiaPrima.nombre,
      categoria: result.materiaPrima.categoria ?? "",
      precio: String(result.materiaPrima.precio),
      stock: String(result.materiaPrima.stockInicial),
    },
    vinculos: result.vinculos.map((v) => ({
      nombreEnInstruccion: v.nombreEnInstruccion,
      nombreProducto: v.nombreProducto,
      existente: v.existente,
      precio: String(v.precio ?? 0),
      categoria: v.categoria ?? "",
      cantidad: String(v.cantidad),
    })),
  };
}

export function LinkItemsForm({ calculatorId }: { calculatorId: string }) {
  const parseAction = parseLinkWithAI.bind(null, calculatorId);
  const applyAction = applyLinking.bind(null, calculatorId);

  const [parseState, parseFormAction, parsePending] = useActionState(parseAction, undefined);
  const [applyState, applyFormAction, applyPending] = useActionState(applyAction, undefined);

  const [mp, setMp] = useState<MateriaPrimaRow | null>(null);
  const [vinculos, setVinculos] = useState<VinculoRow[]>([]);
  const [syncedState, setSyncedState] = useState(parseState);

  if (parseState !== syncedState) {
    setSyncedState(parseState);
    if (parseState?.result) {
      const rows = toRows(parseState.result);
      setMp(rows.mp);
      setVinculos(rows.vinculos);
    }
  }

  function updateMp(field: keyof MateriaPrimaRow, value: string) {
    setMp((prev) => prev && { ...prev, [field]: value });
  }

  function updateVinculo(index: number, field: keyof VinculoRow, value: string) {
    setVinculos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVinculo(index: number) {
    setVinculos((prev) => prev.filter((_, i) => i !== index));
  }

  const vinculosJson = JSON.stringify(
    vinculos.map((v) => ({
      nombreProducto: v.nombreProducto,
      existente: v.existente,
      precio: Number(v.precio),
      categoria: v.categoria || null,
      cantidad: Number(v.cantidad),
    }))
  );

  const hasPreview = mp !== null && vinculos.length > 0;

  return (
    <div className="space-y-8">
      <form action={parseFormAction} className="space-y-3 max-w-2xl">
        <label
          htmlFor="instruction"
          className="text-xs font-medium text-neutral-400 uppercase tracking-wide"
        >
          Instrucción en lenguaje natural
        </label>
        <textarea
          id="instruction"
          name="instruction"
          rows={4}
          required
          placeholder={`Ejemplo: "Vincúlame Neumáticos Trabajador y Neumáticos Clientes al mismo inventario"`}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {parseState?.message && <p className="text-sm text-red-400">{parseState.message}</p>}
        <button
          type="submit"
          disabled={parsePending}
          className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {parsePending ? "Analizando..." : "Generar con IA"}
        </button>
      </form>

      {hasPreview && (
        <form action={applyFormAction} className="space-y-6 max-w-2xl">
          {/* Materia Prima */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Materia prima a crear</h3>
            <div className="border border-neutral-800 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Nombre
                  </label>
                  <input
                    name="mp_nombre"
                    type="text"
                    required
                    value={mp.nombre}
                    onChange={(e) => updateMp("nombre", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Categoría (opcional)
                  </label>
                  <input
                    name="mp_categoria"
                    type="text"
                    value={mp.categoria}
                    onChange={(e) => updateMp("categoria", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Precio (€)
                  </label>
                  <input
                    name="mp_precio"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={mp.precio}
                    onChange={(e) => updateMp("precio", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Stock inicial
                  </label>
                  <input
                    name="mp_stock"
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={mp.stock}
                    onChange={(e) => updateMp("stock", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vínculos */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Productos a vincular</h3>
            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Precio (€)</th>
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-left">Cantidad en receta</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {vinculos.map((v, index) => (
                    <tr key={index} className="border-t border-neutral-800">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={v.nombreProducto}
                          onChange={(e) => updateVinculo(index, "nombreProducto", e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                        />
                        {v.nombreEnInstruccion !== v.nombreProducto && (
                          <p className="text-xs text-neutral-500 mt-0.5 truncate">
                            &quot;{v.nombreEnInstruccion}&quot;
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {v.existente ? (
                          <span className="text-xs bg-green-900/40 text-green-400 border border-green-800 rounded-full px-2 py-0.5">
                            Existente
                          </span>
                        ) : (
                          <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-800 rounded-full px-2 py-0.5">
                            Nuevo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.precio}
                          disabled={v.existente}
                          onChange={(e) => updateVinculo(index, "precio", e.target.value)}
                          className="w-24 bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={v.categoria}
                          disabled={v.existente}
                          onChange={(e) => updateVinculo(index, "categoria", e.target.value)}
                          className="w-32 bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={v.cantidad}
                          onChange={(e) => updateVinculo(index, "cantidad", e.target.value)}
                          className="w-20 bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeVinculo(index)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <input type="hidden" name="vinculos" value={vinculosJson} />

          {applyState?.message && <p className="text-sm text-red-400">{applyState.message}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={applyPending || vinculos.length === 0}
              className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {applyPending ? "Aplicando..." : "Aplicar vínculos"}
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
