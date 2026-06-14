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

  const items = await prisma.item.findMany({
    where: { calculatorId: id },
    orderBy: { name: "asc" },
  });

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
        items={items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price.toString(),
          stock: item.stock,
          category: item.category,
          imageUrl: item.imageUrl,
        }))}
      />
    </section>
  );
}
