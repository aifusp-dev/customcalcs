"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { slugify } from "@/lib/slug";
import {
  CalculatorFormSchema,
  type CalculatorFormState,
  CalculatorThemeFormSchema,
  type CalculatorThemeFormState,
} from "@/lib/definitions";

async function generateUniqueSlug(name: string) {
  const base = slugify(name) || "calculadora";

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate =
      attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 7)}`;
    const existing = await prisma.calculator.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  return `${base}-${Date.now()}`;
}

export async function createCalculator(
  _state: CalculatorFormState,
  formData: FormData
): Promise<CalculatorFormState> {
  const { userId } = await verifySession();

  const validatedFields = CalculatorFormSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name } = validatedFields.data;
  const slug = await generateUniqueSlug(name);

  const calculator = await prisma.calculator.create({
    data: { name, slug, ownerId: userId },
    select: { id: true },
  });

  redirect(`/dashboard/calculators/${calculator.id}`);
}

export async function updateCalculator(
  calculatorId: string,
  _state: CalculatorFormState,
  formData: FormData
): Promise<CalculatorFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para editar esta calculadora." };
  }

  const validatedFields = CalculatorFormSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await prisma.calculator.update({
    where: { id: calculatorId },
    data: { name: validatedFields.data.name },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  return { message: "Calculadora actualizada." };
}

export async function deleteCalculator(calculatorId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    throw new Error("No tienes permiso para eliminar esta calculadora.");
  }

  await prisma.calculator.delete({ where: { id: calculatorId } });

  redirect("/dashboard");
}

export async function updateCalculatorTheme(
  calculatorId: string,
  _state: CalculatorThemeFormState,
  formData: FormData
): Promise<CalculatorThemeFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para editar esta calculadora." };
  }

  const validatedFields = CalculatorThemeFormSchema.safeParse({
    accentColor: formData.get("accentColor"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await prisma.calculator.update({
    where: { id: calculatorId },
    data: { accentColor: validatedFields.data.accentColor },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}`, "layout");
  return { message: "Color actualizado." };
}
