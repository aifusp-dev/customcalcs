"use client";

import { clearSalesHistory } from "@/app/actions/sales";

export function ClearSalesButton({ calculatorId }: { calculatorId: string }) {
  return (
    <form
      action={clearSalesHistory.bind(null, calculatorId)}
      onSubmit={(event) => {
        if (
          !confirm(
            "¿Limpiar el registro de ventas? Las ventas no se borrarán, pero dejarán de aparecer en la lista hasta que actives \"Ver historial completo\"."
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 text-red-400 hover:bg-neutral-900 transition-colors whitespace-nowrap"
      >
        Limpiar registros
      </button>
    </form>
  );
}
