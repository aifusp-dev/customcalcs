import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";

const roleLabels: Record<string, string> = {
  OWNER: "Dueño",
  ADMIN: "Administrador",
  EDITOR: "Editor",
  MEMBER: "Miembro",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      googleId: true,
      createdAt: true,
      ownedCalculators: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          _count: { select: { items: true, members: true, sales: true } },
        },
      },
      memberships: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          role: true,
          calculator: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const [salesAgg, recentSales] = await Promise.all([
    prisma.sale.aggregate({
      where: { userId: id },
      _count: true,
      _sum: { total: true },
    }),
    prisma.sale.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        total: true,
        createdAt: true,
        calculator: { select: { id: true, name: true } },
      },
    }),
  ]);

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <Link
          href="/admin/users"
          className="text-xs text-neutral-400 underline hover:text-white"
        >
          ← Volver a usuarios
        </Link>
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-neutral-400">{user.email}</p>
        <p className="text-xs text-neutral-500">
          {user.googleId ? "Google" : "Email"} · Registrado el{" "}
          {formatDateTime(user.createdAt)}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">
          Calculadoras propias ({user.ownedCalculators.length})
        </h3>
        {user.ownedCalculators.length === 0 ? (
          <p className="text-sm text-neutral-400">No tiene calculadoras propias.</p>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Slug</th>
                  <th className="px-4 py-2.5">Productos</th>
                  <th className="px-4 py-2.5">Miembros</th>
                  <th className="px-4 py-2.5">Ventas</th>
                  <th className="px-4 py-2.5">Creada</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {user.ownedCalculators.map((calculator) => (
                  <tr key={calculator.id} className="border-b border-neutral-900 last:border-0">
                    <td className="px-4 py-2.5">{calculator.name}</td>
                    <td className="px-4 py-2.5 text-neutral-400">{calculator.slug}</td>
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
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">
          Membresías ({user.memberships.length})
        </h3>
        {user.memberships.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No es miembro de ninguna calculadora ajena.
          </p>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
                  <th className="px-4 py-2.5">Calculadora</th>
                  <th className="px-4 py-2.5">Rol</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {user.memberships.map((membership) => (
                  <tr key={membership.id} className="border-b border-neutral-900 last:border-0">
                    <td className="px-4 py-2.5">{membership.calculator.name}</td>
                    <td className="px-4 py-2.5 text-neutral-400">
                      {roleLabels[membership.role] ?? membership.role}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/dashboard/calculators/${membership.calculator.id}`}
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
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">
          Ventas registradas ({salesAgg._count}
          {salesAgg._count > 0 && (
            <span className="text-neutral-400 font-normal">
              {" "}
              · Total: {formatPrice(salesAgg._sum.total ?? 0)}
            </span>
          )}
          )
        </h3>
        {recentSales.length === 0 ? (
          <p className="text-sm text-neutral-400">No ha registrado ninguna venta.</p>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
                  <th className="px-4 py-2.5">Calculadora</th>
                  <th className="px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-neutral-900 last:border-0">
                    <td className="px-4 py-2.5">{sale.calculator.name}</td>
                    <td className="px-4 py-2.5">{formatPrice(sale.total)}</td>
                    <td className="px-4 py-2.5 text-neutral-400">
                      {formatDateTime(sale.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {salesAgg._count > recentSales.length && (
              <p className="px-4 py-2.5 text-xs text-neutral-500 border-t border-neutral-800">
                Mostrando las {recentSales.length} ventas más recientes de{" "}
                {salesAgg._count}.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
