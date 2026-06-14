import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import StockRow from "./StockRow";

export default async function StockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (role !== "OWNER" && role !== "EDITOR") notFound();

  const items = await prisma.item.findMany({
    where: { calculatorId: id },
    orderBy: { name: "asc" },
  });

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Stock</h2>
        <p className="text-sm text-neutral-400">
          Ajusta las unidades disponibles de cada producto.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Todavía no hay productos en esta calculadora.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((item) => (
            <StockRow
              key={item.id}
              calculatorId={id}
              item={{
                id: item.id,
                name: item.name,
                category: item.category,
                stock: item.stock,
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
