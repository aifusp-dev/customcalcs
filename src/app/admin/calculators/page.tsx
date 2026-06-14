import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function AdminCalculatorsPage() {
  const calculators = await prisma.calculator.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { items: true, members: true, sales: true } },
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Calculadoras ({calculators.length})</h2>
      <div className="overflow-x-auto border border-neutral-800 rounded-lg">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
              <th className="px-4 py-2.5">Nombre</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Dueño</th>
              <th className="px-4 py-2.5">Productos</th>
              <th className="px-4 py-2.5">Miembros</th>
              <th className="px-4 py-2.5">Ventas</th>
              <th className="px-4 py-2.5">Creada</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {calculators.map((calculator) => (
              <tr key={calculator.id} className="border-b border-neutral-900 last:border-0">
                <td className="px-4 py-2.5">{calculator.name}</td>
                <td className="px-4 py-2.5 text-neutral-400">{calculator.slug}</td>
                <td className="px-4 py-2.5 text-neutral-400">{calculator.owner.email}</td>
                <td className="px-4 py-2.5">{calculator._count.items}</td>
                <td className="px-4 py-2.5">{calculator._count.members}</td>
                <td className="px-4 py-2.5">{calculator._count.sales}</td>
                <td className="px-4 py-2.5 text-neutral-400">
                  {formatDateTime(calculator.createdAt)}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/dashboard/calculators/${calculator.id}`}
                    className="text-xs text-neutral-400 underline hover:text-white"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
