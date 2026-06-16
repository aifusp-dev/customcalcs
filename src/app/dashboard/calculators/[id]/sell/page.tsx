import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import SellForm from "./SellForm";

export default async function SellPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!role) notFound();

  const [items, discounts, calculatorData] = await Promise.all([
    prisma.item.findMany({
      where: { calculatorId: id },
      orderBy: { name: "asc" },
      include: {
        ingredients: {
          select: { quantity: true, ingredient: { select: { stock: true } } },
        },
      },
    }),
    prisma.discount.findMany({
      where: { calculatorId: id },
      orderBy: { name: "asc" },
    }),
    prisma.calculator.findUnique({
      where: { id },
      select: { categoryOrder: true },
    }),
  ]);

  let categoryOrder: string[] = [];
  try {
    const raw = calculatorData?.categoryOrder;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((i) => typeof i === "string")) {
        categoryOrder = parsed;
      }
    }
  } catch {}

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Vender</h2>
        <p className="text-sm text-neutral-400">
          Toca + para añadir productos y registra la venta cuando termines.
        </p>
      </div>

      <SellForm
        calculatorId={id}
        categoryOrder={categoryOrder}
        items={items.map((item) => {
          const maxCraftable =
            item.ingredients.length > 0
              ? Math.min(
                  ...item.ingredients.map((ing) =>
                    Math.floor(ing.ingredient.stock / ing.quantity)
                  )
                )
              : 0;

          return {
            id: item.id,
            name: item.name,
            price: item.price.toString(),
            stock: item.stock + maxCraftable,
            category: item.category,
            imageUrl: item.imageUrl,
          };
        })}
        discounts={discounts.map((discount) => ({
          id: discount.id,
          name: discount.name,
          percentage: discount.percentage.toString(),
        }))}
      />
    </section>
  );
}
