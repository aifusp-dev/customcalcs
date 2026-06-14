"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { CustomerFormSchema, type CustomerFormState } from "@/lib/definitions";

export async function createCustomer(
  calculatorId: string,
  _state: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role) && role !== "EDITOR") {
    return { message: "No tienes permiso para gestionar clientes en esta calculadora." };
  }

  const validatedFields = CustomerFormSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, notes } = validatedFields.data;

  await prisma.customer.create({
    data: { calculatorId, name, notes: notes?.trim() || null },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/customers`);
}

export async function updateCustomer(
  calculatorId: string,
  customerId: string,
  _state: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role) && role !== "EDITOR") {
    return { message: "No tienes permiso para gestionar clientes en esta calculadora." };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { calculatorId: true },
  });
  if (!customer || customer.calculatorId !== calculatorId) {
    return { message: "Cliente no encontrado." };
  }

  const validatedFields = CustomerFormSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, notes } = validatedFields.data;

  await prisma.customer.update({
    where: { id: customerId },
    data: { name, notes: notes?.trim() || null },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/customers`);
  return { message: "Cliente actualizado." };
}

export async function deleteCustomer(calculatorId: string, customerId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role) && role !== "EDITOR") {
    throw new Error("No tienes permiso para gestionar clientes en esta calculadora.");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { calculatorId: true },
  });
  if (!customer || customer.calculatorId !== calculatorId) {
    throw new Error("Cliente no encontrado.");
  }

  await prisma.customer.delete({ where: { id: customerId } });

  revalidatePath(`/dashboard/calculators/${calculatorId}/customers`);
}
