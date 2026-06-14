import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      googleId: true,
      createdAt: true,
      _count: { select: { ownedCalculators: true, memberships: true, sales: true } },
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Usuarios ({users.length})</h2>
      <div className="overflow-x-auto border border-neutral-800 rounded-lg">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-xs text-neutral-500 uppercase tracking-wide border-b border-neutral-800">
              <th className="px-4 py-2.5">Nombre</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Acceso</th>
              <th className="px-4 py-2.5">Calculadoras</th>
              <th className="px-4 py-2.5">Membresías</th>
              <th className="px-4 py-2.5">Ventas</th>
              <th className="px-4 py-2.5">Registrado</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-neutral-900 last:border-0">
                <td className="px-4 py-2.5">{user.name}</td>
                <td className="px-4 py-2.5 text-neutral-400">{user.email}</td>
                <td className="px-4 py-2.5 text-neutral-400">
                  {user.googleId ? "Google" : "Email"}
                </td>
                <td className="px-4 py-2.5">{user._count.ownedCalculators}</td>
                <td className="px-4 py-2.5">{user._count.memberships}</td>
                <td className="px-4 py-2.5">{user._count.sales}</td>
                <td className="px-4 py-2.5 text-neutral-400">
                  {formatDateTime(user.createdAt)}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/users/${user.id}`}
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
