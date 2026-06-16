import { prisma } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";

export default async function AdminSalesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      calculator: { select: { name: true } },
      user: { select: { name: true, email: true } },
      items: { select: { name: true, quantity: true } },
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Últimas ventas ({sales.length})</h2>
      <div className="overflow-x-auto border border-neutral-800 rounded-lg">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
              <th className="px-4 py-2.5">Fecha</th>
              <th className="px-4 py-2.5">Calculadora</th>
              <th className="px-4 py-2.5">Usuario</th>
              <th className="px-4 py-2.5">Productos</th>
              <th className="px-4 py-2.5">Nota</th>
              <th className="px-4 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-neutral-900 last:border-0">
                <td className="px-4 py-2.5 text-neutral-400">
                  {formatDateTime(sale.createdAt)}
                </td>
                <td className="px-4 py-2.5">{sale.calculator.name}</td>
                <td className="px-4 py-2.5 text-neutral-400">{sale.user.name}</td>
                <td className="px-4 py-2.5 text-neutral-400 max-w-xs truncate">
                  {sale.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                </td>
                <td className="px-4 py-2.5 text-neutral-400 max-w-xs truncate">
                  {sale.note}
                </td>
                <td className="px-4 py-2.5 text-right font-medium">
                  {formatPrice(sale.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
