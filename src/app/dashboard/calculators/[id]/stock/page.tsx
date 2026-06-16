import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import StockRow from "./StockRow";
import { ItemsFilter } from "../items/ItemsFilter";

export default async function StockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; category?: string }>;
}) {
  const { id } = await params;
  const { name: filterName, category: filterCategory } = await searchParams;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role) && role !== "EDITOR") notFound();

  const [items, categoryRows] = await Promise.all([
    prisma.item.findMany({
      where: {
        calculatorId: id,
        ...(filterName ? { name: { contains: filterName, mode: "insensitive" } } : {}),
        ...(filterCategory ? { category: filterCategory } : {}),
      },
      orderBy: { name: "asc" },
      include: {
        ingredients: {
          select: {
            quantity: true,
            ingredient: { select: { id: true, name: true, stock: true } },
          },
        },
      },
    }),
    prisma.item.findMany({
      where: { calculatorId: id, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const categories = categoryRows.map((r) => r.category!);

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Stock</h2>
          <p className="text-sm text-neutral-400">
            Ajusta las unidades disponibles de cada producto.
          </p>
        </div>
        <ItemsFilter categories={categories} />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          {filterName || filterCategory
            ? "No hay productos que coincidan con los filtros."
            : "Todavía no hay productos en esta calculadora."}
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
                recipe: item.ingredients.map((row) => ({
                  name: row.ingredient.name,
                  quantity: row.quantity,
                  stock: row.ingredient.stock,
                })),
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
