import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getContrastColor } from "@/lib/colors";
import { NavMenu } from "./NavMenu";

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
    select: { name: true, accentColor: true },
  });
  if (!calculator) {
    notFound();
  }

  const accentForeground = getContrastColor(calculator.accentColor);

  const canManageStock = role === "OWNER" || role === "EDITOR";

  const tabs = [
    { href: `/dashboard/calculators/${id}`, label: "Productos" },
    { href: `/dashboard/calculators/${id}/sell`, label: "Vender" },
    ...(canManageStock
      ? [{ href: `/dashboard/calculators/${id}/sales`, label: "Ventas" }]
      : []),
  ];

  const managementItems = [
    ...(canManageStock
      ? [{ href: `/dashboard/calculators/${id}/stock`, label: "Stock" }]
      : []),
    ...(role === "OWNER"
      ? [{ href: `/dashboard/calculators/${id}/discounts`, label: "Descuentos" }]
      : []),
  ];

  const settingsItems =
    role === "OWNER"
      ? [
          { href: `/dashboard/calculators/${id}/members`, label: "Miembros" },
          { href: `/dashboard/calculators/${id}/discord`, label: "Discord" },
          { href: `/dashboard/calculators/${id}/settings`, label: "Ajustes" },
          { href: `/dashboard/calculators/${id}/profile`, label: "Mi nombre" },
        ]
      : [];

  return (
    <div
      className="min-h-screen px-4 py-12"
      style={
        {
          "--accent": calculator.accentColor,
          "--accent-fg": accentForeground,
        } as React.CSSProperties
      }
    >
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:underline">
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{calculator.name}</h1>
        </div>

        <nav className="flex items-center gap-2 border-b border-neutral-800 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-3 py-2 text-sm text-neutral-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {tab.label}
            </Link>
          ))}

          {managementItems.length === 1 ? (
            <Link
              href={managementItems[0].href}
              className="px-3 py-2 text-sm text-neutral-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {managementItems[0].label}
            </Link>
          ) : managementItems.length > 1 ? (
            <NavMenu label="Gestión" items={managementItems} />
          ) : null}

          {settingsItems.length > 0 ? (
            <NavMenu label="Ajustes" items={settingsItems} />
          ) : (
            <Link
              href={`/dashboard/calculators/${id}/profile`}
              className="px-3 py-2 text-sm text-neutral-300 hover:text-white whitespace-nowrap transition-colors"
            >
              Mi nombre
            </Link>
          )}
        </nav>

        {children}
      </div>
    </div>
  );
}
