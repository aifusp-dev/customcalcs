"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import {
  InviteMemberFormSchema,
  type InviteMemberFormState,
  DisplayNameFormSchema,
  type DisplayNameFormState,
} from "@/lib/definitions";

export async function inviteMember(
  calculatorId: string,
  _state: InviteMemberFormState,
  formData: FormData
): Promise<InviteMemberFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    return { message: "No tienes permiso para invitar usuarios a esta calculadora." };
  }

  const validatedFields = InviteMemberFormSchema.safeParse({
    email: formData.get("email"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email } = validatedFields.data;

  const calculator = await prisma.calculator.findUnique({
    where: { id: calculatorId },
    select: { ownerId: true },
  });
  if (!calculator) {
    return { message: "Calculadora no encontrada." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "No existe ningún usuario registrado con ese email." };
  }

  if (user.id === calculator.ownerId) {
    return { message: "Ese usuario ya es el dueño de la calculadora." };
  }

  const existing = await prisma.calculatorMember.findUnique({
    where: { calculatorId_userId: { calculatorId, userId: user.id } },
  });
  if (existing) {
    return { message: "Ese usuario ya tiene acceso a esta calculadora." };
  }

  await prisma.calculatorMember.create({
    data: { calculatorId, userId: user.id },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/members`);
  return { message: `${user.name} ha sido invitado correctamente.` };
}

export async function setMemberRole(
  calculatorId: string,
  memberId: string,
  formData: FormData
) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    throw new Error("No tienes permiso para gestionar miembros de esta calculadora.");
  }

  const newRole = formData.get("role");
  if (newRole !== "MEMBER" && newRole !== "EDITOR") {
    throw new Error("Rol no válido.");
  }

  const member = await prisma.calculatorMember.findUnique({
    where: { id: memberId },
    select: { calculatorId: true },
  });
  if (!member || member.calculatorId !== calculatorId) {
    throw new Error("Miembro no encontrado.");
  }

  await prisma.calculatorMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/members`);
}

export async function setMyDisplayName(
  calculatorId: string,
  _state: DisplayNameFormState,
  formData: FormData
): Promise<DisplayNameFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!role) {
    return { message: "No tienes acceso a esta calculadora." };
  }

  const validatedFields = DisplayNameFormSchema.safeParse({
    displayName: formData.get("displayName"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const displayName = validatedFields.data.displayName?.trim() || null;

  if (role === "OWNER") {
    await prisma.calculator.update({
      where: { id: calculatorId },
      data: { ownerDisplayName: displayName },
    });
  } else {
    await prisma.calculatorMember.update({
      where: { calculatorId_userId: { calculatorId, userId } },
      data: { displayName },
    });
  }

  revalidatePath(`/dashboard/calculators/${calculatorId}`, "layout");
  return { message: "Nombre actualizado." };
}

export async function removeMember(calculatorId: string, memberId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    throw new Error("No tienes permiso para gestionar miembros de esta calculadora.");
  }

  const member = await prisma.calculatorMember.findUnique({
    where: { id: memberId },
    select: { calculatorId: true },
  });
  if (!member || member.calculatorId !== calculatorId) {
    throw new Error("Miembro no encontrado.");
  }

  await prisma.calculatorMember.delete({ where: { id: memberId } });

  revalidatePath(`/dashboard/calculators/${calculatorId}/members`);
}
