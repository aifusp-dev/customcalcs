import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [userCount, calculatorCount, itemCount, saleCount, salesAgg, stockAgg] =
    await Promise.all([
      prisma.user.count(),
      prisma.calculator.count(),
      prisma.item.count(),
      prisma.sale.count(),
      prisma.sale.aggregate({ _sum: { total: true } }),
      prisma.item.aggregate({ _sum: { stock: true } }),
    ]);

  const stats = [
    { label: "Usuarios", value: userCount.toString() },
    { label: "Calculadoras", value: calculatorCount.toString() },
    { label: "Productos", value: itemCount.toString() },
    { label: "Unidades en stock", value: (stockAgg._sum.stock ?? 0).toString() },
    { label: "Ventas", value: saleCount.toString() },
    { label: "Ingresos totales", value: formatPrice(salesAgg._sum.total ?? 0) },
  ];

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-neutral-800 rounded-lg p-4 space-y-1">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">{stat.label}</p>
          <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
