"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";

export async function generateInviteLink(calculatorId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    throw new Error("No tienes permiso para gestionar miembros de esta calculadora.");
  }

  await prisma.calculator.update({
    where: { id: calculatorId },
    data: { inviteToken: randomUUID() },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/members`);
}

export async function revokeInviteLink(calculatorId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    throw new Error("No tienes permiso para gestionar miembros de esta calculadora.");
  }

  await prisma.calculator.update({
    where: { id: calculatorId },
    data: { inviteToken: null },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/members`);
}

export async function joinCalculatorViaInvite(token: string) {
  const { userId } = await verifySession();

  const calculator = await prisma.calculator.findUnique({
    where: { inviteToken: token },
    select: { id: true, ownerId: true },
  });
  if (!calculator) {
    redirect(`/invite/${token}`);
  }

  if (calculator.ownerId !== userId) {
    await prisma.calculatorMember.upsert({
      where: { calculatorId_userId: { calculatorId: calculator.id, userId } },
      update: {},
      create: { calculatorId: calculator.id, userId, role: "MEMBER" },
    });
  }

  revalidatePath(`/dashboard/calculators/${calculator.id}/members`);
  redirect(`/dashboard/calculators/${calculator.id}`);
}
