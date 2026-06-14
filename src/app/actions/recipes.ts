"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";

export async function setItemRecipe(calculatorId: string, itemId: string, formData: FormData) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    throw new Error("No tienes permiso para editar productos de esta calculadora.");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { calculatorId: true },
  });
  if (!item || item.calculatorId !== calculatorId) {
    throw new Error("Producto no encontrado.");
  }

  const otherItems = await prisma.item.findMany({
    where: { calculatorId, id: { not: itemId } },
    select: { id: true },
  });

  const ingredients = otherItems
    .map((other) => ({
      ingredientId: other.id,
      quantity: Number(formData.get(`ingredient-${other.id}`) ?? 0),
    }))
    .filter((entry) => Number.isInteger(entry.quantity) && entry.quantity > 0);

  await prisma.$transaction([
    prisma.itemIngredient.deleteMany({ where: { itemId } }),
    ...ingredients.map((entry) =>
      prisma.itemIngredient.create({
        data: { itemId, ingredientId: entry.ingredientId, quantity: entry.quantity },
      })
    ),
  ]);

  revalidatePath(`/dashboard/calculators/${calculatorId}/items/${itemId}/edit`);
  revalidatePath(`/dashboard/calculators/${calculatorId}/stock`);
}

export async function craftItem(calculatorId: string, itemId: string, formData: FormData) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role) && role !== "EDITOR") {
    throw new Error("No tienes permiso para gestionar el stock de esta calculadora.");
  }

  const quantity = Number(formData.get("quantity"));
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("La cantidad a fabricar debe ser un número entero positivo.");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      calculatorId: true,
      ingredients: {
        select: {
          quantity: true,
          ingredient: { select: { id: true, name: true, stock: true } },
        },
      },
    },
  });
  if (!item || item.calculatorId !== calculatorId) {
    throw new Error("Producto no encontrado.");
  }
  if (item.ingredients.length === 0) {
    throw new Error("Este producto no tiene receta configurada.");
  }

  for (const { ingredient, quantity: needed } of item.ingredients) {
    const required = needed * quantity;
    if (ingredient.stock < required) {
      throw new Error(
        `No hay suficiente stock de ${ingredient.name} (necesario: ${required}, disponible: ${ingredient.stock}).`
      );
    }
  }

  await prisma.$transaction([
    ...item.ingredients.map(({ ingredient, quantity: needed }) =>
      prisma.item.update({
        where: { id: ingredient.id },
        data: { stock: { decrement: needed * quantity } },
      })
    ),
    prisma.item.update({ where: { id: itemId }, data: { stock: { increment: quantity } } }),
  ]);

  revalidatePath(`/dashboard/calculators/${calculatorId}/stock`);
  revalidatePath(`/dashboard/calculators/${calculatorId}`);
}
