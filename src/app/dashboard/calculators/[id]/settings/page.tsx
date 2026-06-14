import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { UpdateCalculatorForm, ThemeForm, DeleteCalculatorForm } from "./SettingsForms";

export default async function CalculatorSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role)) notFound();

  const calculator = await prisma.calculator.findUnique({
    where: { id },
    select: { name: true, slug: true, accentColor: true },
  });
  if (!calculator) notFound();

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
