import "server-only";
import { prisma } from "@/lib/db";

/**
 * Devuelve, para cada usuario con acceso a la calculadora, el nombre que debe
 * mostrarse en el contexto de esa calculadora (apodo si lo ha puesto, o su
 * nombre de cuenta si no).
 */
export async function getCalculatorDisplayNames(calculatorId: string): Promise<Map<string, string>> {
  const calculator = await prisma.calculator.findUnique({
    where: { id: calculatorId },
    select: {
      ownerId: true,
      ownerDisplayName: true,
      owner: { select: { name: true } },
      members: {
        select: { userId: true, displayName: true, user: { select: { name: true } } },
      },
    },
  });

  const names = new Map<string, string>();
  if (!calculator) return names;

  names.set(calculator.ownerId, calculator.ownerDisplayName || calculator.owner.name);
  for (const member of calculator.members) {
    names.set(member.userId, member.displayName || member.user.name);
  }

  return names;
}
