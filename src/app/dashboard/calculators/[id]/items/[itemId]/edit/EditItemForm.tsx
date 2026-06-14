"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateItem } from "@/app/actions/items";

export default function EditItemForm({
  calculatorId,
  item,
}: {
  calculatorId: string;
  item: {
    id: string;
    name: string;
    price: string;
    stock: number;
    category: string | null;
    imageUrl: string | null;
  };
}) {
  const action = updateItem.bind(null, calculatorId, item.id);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
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
          defaultValue={item.name}
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
          defaultValue={item.price}
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
          required
          defaultValue={item.stock}
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
          defaultValue={item.category ?? ""}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {state?.errors?.category && (
          <p className="text-xs text-red-400">{state.errors.category[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="image" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Imagen {item.imageUrl ? "(deja vacío para mantener la actual)" : "(opcional)"}
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
          className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
        <Link
          href={`/dashboard/calculators/${calculatorId}`}
          className="border border-neutral-800 rounded-lg px-4 py-2.5 text-sm hover:bg-neutral-900 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
