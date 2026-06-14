import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { deleteDiscount } from "@/app/actions/discounts";
import { CreateDiscountForm } from "./CreateDiscountForm";

export default async function DiscountsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role)) notFound();

  const discounts = await prisma.discount.findMany({
    where: { calculatorId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Crear descuento</h2>
          <p className="text-sm text-neutral-400">
            Los descuentos creados aquí estarán disponibles para seleccionar en la
            terminal de ventas.
          </p>
        </div>
        <CreateDiscountForm calculatorId={id} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Descuentos</h2>

        {discounts.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Todavía no has creado ningún descuento.
          </p>
        ) : (
          <ul className="space-y-2">
            {discounts.map((discount) => (
              <li
                key={discount.id}
                className="flex items-center gap-4 border border-neutral-800 rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{discount.name}</p>
                </div>
                <p className="font-semibold whitespace-nowrap">
                  -{discount.percentage.toString()}%
                </p>
                <form
                  action={async () => {
                    "use server";
                    await deleteDiscount(id, discount.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 text-red-400 hover:bg-neutral-900 transition-colors"
                  >
                    Eliminar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
