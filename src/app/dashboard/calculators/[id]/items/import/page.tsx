import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { ImportItemsForm } from "./ImportItemsForm";

export default async function ImportItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role)) notFound();

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Importar productos con IA</h2>
        <p className="text-sm text-neutral-400">
          Pega un listado de productos (con categorías como cabeceras y líneas
          &quot;NOMBRE: PRECIO&quot;) y la IA generará las filas automáticamente. Podrás
          revisarlas y editarlas antes de guardarlas.
        </p>
      </div>

      <ImportItemsForm calculatorId={id} />
    </section>
  );
}
