import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { DisplayNameForm } from "./DisplayNameForm";

export default async function CalculatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!role) notFound();

  let displayName: string | null = null;
  if (role === "OWNER") {
    const calculator = await prisma.calculator.findUnique({
      where: { id },
      select: { ownerDisplayName: true },
    });
    displayName = calculator?.ownerDisplayName ?? null;
  } else {
    const member = await prisma.calculatorMember.findUnique({
      where: { calculatorId_userId: { calculatorId: id, userId } },
      select: { displayName: true },
    });
    displayName = member?.displayName ?? null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Mi nombre en esta calculadora</h2>
        <p className="text-sm text-neutral-400">
          Este nombre se usará en lugar del tuyo en el registro de ventas y en las
          notificaciones de Discord de esta calculadora. Déjalo vacío para usar tu
          nombre de cuenta.
        </p>
      </div>

      <DisplayNameForm calculatorId={id} displayName={displayName} />
    </section>
  );
}
