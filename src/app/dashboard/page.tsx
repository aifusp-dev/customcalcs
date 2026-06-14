import Link from "next/link";
import { verifySession, getCurrentUser, isAdminEmail } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { InstallAppButton } from "@/components/install-app-button";

export default async function DashboardPage() {
  const { userId } = await verifySession();
  const user = await getCurrentUser();

  const [owned, memberships] = await Promise.all([
    prisma.calculator.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.calculatorMember.findMany({
      where: { userId },
      include: { calculator: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="w-full max-w-3xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CustomCalcs</h1>
            <p className="text-sm text-neutral-400">Hola, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <InstallAppButton />
            {user && isAdminEmail(user.email) && (
              <Link
                href="/admin"
                className="text-sm border border-neutral-800 rounded-lg px-4 py-2 hover:bg-neutral-900 transition-colors"
              >
                Admin
              </Link>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="text-sm border border-neutral-800 rounded-lg px-4 py-2 hover:bg-neutral-900 transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tus calculadoras</h2>
            <Link
              href="/dashboard/calculators/new"
              className="text-sm bg-white text-black font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Nueva calculadora
            </Link>
          </div>

          {owned.length === 0 ? (
            <p className="text-sm text-neutral-400">
              Aún no has creado ninguna calculadora.
            </p>
          ) : (
            <ul className="space-y-2">
              {owned.map((calculator) => (
                <li key={calculator.id}>
                  <Link
                    href={`/dashboard/calculators/${calculator.id}`}
                    className="flex items-center justify-between border border-neutral-800 rounded-lg px-4 py-3 hover:bg-neutral-900 transition-colors"
                  >
                    <span>{calculator.name}</span>
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">
                      Dueño
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Calculadoras compartidas</h2>

          {memberships.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No tienes acceso a calculadoras de otros usuarios todavía.
            </p>
          ) : (
            <ul className="space-y-2">
              {memberships.map((membership) => (
                <li key={membership.id}>
                  <Link
                    href={`/dashboard/calculators/${membership.calculator.id}`}
                    className="flex items-center justify-between border border-neutral-800 rounded-lg px-4 py-3 hover:bg-neutral-900 transition-colors"
                  >
                    <span>{membership.calculator.name}</span>
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">
                      {membership.role === "EDITOR" ? "Editor" : membership.role}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
