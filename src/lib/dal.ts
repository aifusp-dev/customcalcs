import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return { userId: session.userId };
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
});

export function isAdminEmail(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase());
}

export const requireAdmin = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  return user;
});

/**
 * Devuelve el rol del usuario en una calculadora (incluyendo OWNER si es el dueño),
 * o null si no tiene acceso.
 */
export const getCalculatorRole = cache(
  async (calculatorId: string, userId: string) => {
    const calculator = await prisma.calculator.findUnique({
      where: { id: calculatorId },
      select: {
        ownerId: true,
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!calculator) return null;
    if (calculator.ownerId === userId) return "OWNER" as const;
    return calculator.members[0]?.role ?? null;
  }
);

/**
 * Los administradores tienen los mismos permisos que el dueño salvo eliminar
 * la calculadora.
 */
export function canManageCalculator(role: string | null) {
  return role === "OWNER" || role === "ADMIN";
}
