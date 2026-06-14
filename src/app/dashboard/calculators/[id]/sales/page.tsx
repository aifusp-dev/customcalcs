import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import { getCalculatorDisplayNames } from "@/lib/displayNames";

export default async function SalesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (role !== "OWNER" && role !== "EDITOR") notFound();

  const sales = await prisma.sale.findMany({
    where: { calculatorId: id },
    include: {
      user: { select: { name: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const displayNames = await getCalculatorDisplayNames(id);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Registro de ventas</h2>
        <p className="text-sm text-neutral-400">
          Últimas {sales.length} ventas registradas en esta calculadora.
        </p>
      </div>

      {sales.length === 0 ? (
        <p className="text-sm text-neutral-400">Todavía no hay ventas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {sales.map((sale) => (
            <li key={sale.id} className="border border-neutral-800 rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{formatPrice(sale.total)}</p>
                  <p className="text-xs text-neutral-400">
                    {formatDateTime(sale.createdAt)} · {displayNames.get(sale.userId) ?? sale.user.name}
                  </p>
                </div>
              </div>
              <ul className="text-sm text-neutral-300 space-y-0.5">
                {sale.items.map((line) => (
                  <li key={line.id} className="flex items-center justify-between">
                    <span>
                      {line.quantity} × {line.name}
                    </span>
                    <span className="text-neutral-400">
                      {formatPrice(Number(line.price) * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
