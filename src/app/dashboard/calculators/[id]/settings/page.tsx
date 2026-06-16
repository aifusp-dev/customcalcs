import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { UpdateCalculatorForm, ThemeForm, DeleteCalculatorForm } from "./SettingsForms";
import { CategoryOrderForm } from "./CategoryOrderForm";
import { HiddenCategoriesForm } from "./HiddenCategoriesForm";

function parseJsonStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((i) => typeof i === "string")) return parsed;
  } catch {}
  return [];
}

export default async function CalculatorSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role)) notFound();

  const [calculator, categoryRows] = await Promise.all([
    prisma.calculator.findUnique({
      where: { id },
      select: { name: true, slug: true, accentColor: true, categoryOrder: true, hiddenCategories: true },
    }),
    prisma.item.findMany({
      where: { calculatorId: id, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);
  if (!calculator) notFound();

  const allCategories = categoryRows.map((r) => r.category!);
  const storedOrder = parseJsonStringArray(calculator.categoryOrder);
  const hiddenCategories = parseJsonStringArray(calculator.hiddenCategories);
  const orderedCategories = [
    ...storedOrder.filter((c) => allCategories.includes(c)),
    ...allCategories.filter((c) => !storedOrder.includes(c)),
  ];

  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ajustes</h2>
        <p className="text-sm text-neutral-400">
          Identificador público:{" "}
          <span className="text-neutral-300">{calculator.slug}</span>
        </p>
        <UpdateCalculatorForm calculatorId={id} name={calculator.name} />
      </div>

      <div className="space-y-4 border-t border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold">Personalización</h3>
        <p className="text-sm text-neutral-400">
          Elige el color de los botones y acentos de esta calculadora.
        </p>
        <ThemeForm calculatorId={id} accentColor={calculator.accentColor} />
      </div>

      {orderedCategories.length > 1 && (
        <div className="space-y-4 border-t border-neutral-800 pt-6">
          <h3 className="text-sm font-semibold">Orden de categorías</h3>
          <p className="text-sm text-neutral-400">
            Define el orden en que aparecen las categorías en la pantalla de venta.
          </p>
          <CategoryOrderForm calculatorId={id} categories={orderedCategories} />
        </div>
      )}

      {allCategories.length > 0 && (
        <div className="space-y-4 border-t border-neutral-800 pt-6">
          <h3 className="text-sm font-semibold">Visibilidad de categorías</h3>
          <p className="text-sm text-neutral-400">
            Las categorías marcadas quedan ocultas para los usuarios sin permisos de gestión.
          </p>
          <HiddenCategoriesForm
            calculatorId={id}
            categories={orderedCategories.length > 0 ? orderedCategories : allCategories}
            hiddenCategories={hiddenCategories}
          />
        </div>
      )}

      {role === "OWNER" && (
        <div className="space-y-2 border-t border-neutral-800 pt-6">
          <h3 className="text-sm font-semibold text-red-400">Zona de peligro</h3>
          <p className="text-sm text-neutral-400">
            Eliminar la calculadora borrará también sus productos, miembros y
            ventas. Esta acción no se puede deshacer.
          </p>
          <DeleteCalculatorForm calculatorId={id} />
        </div>
      )}
    </section>
  );
}
