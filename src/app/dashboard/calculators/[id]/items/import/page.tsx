import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { ImportItemsForm } from "./ImportItemsForm";
import { LinkItemsForm } from "./LinkItemsForm";

export default async function ImportItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role)) notFound();

  const isLink = mode === "link";

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Importar / vincular con IA</h2>
        <p className="text-sm text-neutral-400">
          {isLink
            ? "Describe en lenguaje natural qué productos quieres vincular al mismo inventario. La IA creará una materia prima compartida y la añadirá como receta a cada producto."
            : "Pega un listado de productos (con categorías como cabeceras y líneas \"NOMBRE: PRECIO\") y la IA generará las filas automáticamente."}
        </p>
      </div>

      <div className="flex gap-1 border-b border-neutral-800">
        <Link
          href={`/dashboard/calculators/${id}/items/import`}
          className={`px-4 py-2 text-sm transition-colors ${
            !isLink
              ? "border-b-2 border-[var(--accent)] text-white font-medium -mb-px"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Importar productos
        </Link>
        <Link
          href={`/dashboard/calculators/${id}/items/import?mode=link`}
          className={`px-4 py-2 text-sm transition-colors ${
            isLink
              ? "border-b-2 border-[var(--accent)] text-white font-medium -mb-px"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Vincular inventario
        </Link>
      </div>

      {isLink ? (
        <LinkItemsForm calculatorId={id} />
      ) : (
        <ImportItemsForm calculatorId={id} />
      )}
    </section>
  );
}
