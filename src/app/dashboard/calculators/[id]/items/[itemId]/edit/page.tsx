import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import EditItemForm from "./EditItemForm";

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
    </section>
  );
}
