import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";

export default async function CalculatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();

  const role = await getCalculatorRole(id, userId);
  if (!role) {
    notFound();
  }

  const calculator = await prisma.calculator.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!calculator) {
    notFound();
  }

  const canManageStock = role === "OWNER" || role === "EDITOR";

  const tabs = [
    { href: `/dashboard/calculators/${id}`, label: "Productos" },
    ...(canManageStock
      ? [{ href: `/dashboard/calculators/${id}/stock`, label: "Stock" }]
      : []),
    { href: `/dashboard/calculators/${id}/sell`, label: "Vender" },
    ...(canManageStock
      ? [{ href: `/dashboard/calculators/${id}/sales`, label: "Ventas" }]
      : []),
    ...(role === "OWNER"
      ? [{ href: `/dashboard/calculators/${id}/members`, label: "Miembros" }]
      : []),
    ...(role === "OWNER"
      ? [{ href: `/dashboard/calculators/${id}/settings`, label: "Ajustes" }]
      : []),
  ];

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:underline">
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{calculator.name}</h1>
        </div>

        <nav className="flex gap-2 border-b border-neutral-800 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-3 py-2 text-sm text-neutral-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
