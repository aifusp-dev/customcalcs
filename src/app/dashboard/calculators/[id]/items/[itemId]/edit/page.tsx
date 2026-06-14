import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import EditItemForm from "./EditItemForm";
import { RecipeForm } from "./RecipeForm";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role)) notFound();

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.calculatorId !== id) notFound();

  const [otherItems, recipeRows] = await Promise.all([
    prisma.item.findMany({
      where: { calculatorId: id, id: { not: itemId } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true },
    }),
    prisma.itemIngredient.findMany({
      where: { itemId },
      select: { ingredientId: true, quantity: true },
    }),
  ]);

  const recipe = Object.fromEntries(
    recipeRows.map((row) => [row.ingredientId, row.quantity])
  );

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Editar producto</h2>
        <p className="text-sm text-neutral-400">{item.name}</p>
      </div>

      <EditItemForm
        calculatorId={id}
        item={{
          id: item.id,
          name: item.name,
          price: item.price.toString(),
          stock: item.stock,
          category: item.category,
          imageUrl: item.imageUrl,
        }}
      />

      <div className="space-y-3 border-t border-neutral-800 pt-6 max-w-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Receta</h3>
          <p className="text-sm text-neutral-400">
            Indica cuántas unidades de cada producto se necesitan para fabricar 1
            unidad de {item.name}. Déjalo en 0 si no se usa.
          </p>
        </div>
        <RecipeForm calculatorId={id} itemId={itemId} items={otherItems} recipe={recipe} />
      </div>
    </section>
  );
}
