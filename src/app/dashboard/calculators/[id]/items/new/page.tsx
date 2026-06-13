"use client";

import { useActionState } from "react";
import { use } from "react";
import Link from "next/link";
import { createItem } from "@/app/actions/items";

export default function NewItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const action = createItem.bind(null, id);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Nuevo producto</h2>
        <p className="text-sm text-neutral-400">
          Añade un producto con su precio, stock y una imagen opcional.
        </p>
      </div>

      <form action={formAction} className="space-y-4 max-w-sm" encType="multipart/form-data">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
          />
          {state?.errors?.name && (
            <p className="text-xs text-red-400">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="price" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Precio (€)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
          />
          {state?.errors?.price && (
            <p className="text-xs text-red-400">{state.errors.price[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="stock" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            defaultValue={0}
            required
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
          />
          {state?.errors?.stock && (
            <p className="text-xs text-red-400">{state.errors.stock[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Categoría (opcional)
          </label>
          <input
            id="category"
            name="category"
            type="text"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
          />
          {state?.errors?.category && (
            <p className="text-xs text-red-400">{state.errors.category[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="image" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Imagen (opcional)
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-sm file:text-neutral-200"
          />
          {state?.errors?.image && (
            <p className="text-xs text-red-400">{state.errors.image[0]}</p>
          )}
        </div>

        {state?.message && (
          <p className="text-sm text-red-400">{state.message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-white text-black font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar producto"}
          </button>
          <Link
            href={`/dashboard/calculators/${id}`}
            className="border border-neutral-800 rounded-lg px-4 py-2.5 text-sm hover:bg-neutral-900 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
