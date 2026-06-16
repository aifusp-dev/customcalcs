"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole, getCurrentUser, canManageCalculator } from "@/lib/dal";
import { sendSaleNotification } from "@/lib/discord";
import { getCalculatorDisplayNames } from "@/lib/displayNames";
import type { SaleFormState } from "@/lib/definitions";

export async function createSale(
  calculatorId: string,
  _state: SaleFormState,
  formData: FormData
): Promise<SaleFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!role) {
    return { message: "No tienes acceso a esta calculadora." };
  }

  const items = await prisma.item.findMany({
    where: { calculatorId },
    include: {
      ingredients: {
        select: { quantity: true, ingredient: { select: { id: true, name: true } } },
      },
    },
  });

  const remainingStock = new Map(items.map((item) => [item.id, item.stock]));

  const lines: { itemId: string; name: string; price: string; quantity: number }[] = [];
  const craftNeeds: { item: (typeof items)[number]; craftQty: number }[] = [];

  for (const item of items) {
    const raw = formData.get(`quantity-${item.id}`);
    const quantity = Number(raw ?? 0);
    if (quantity <= 0) continue;
    if (!Number.isInteger(quantity)) {
      return { message: `Cantidad no válida para ${item.name}.` };
    }

    const available = remainingStock.get(item.id)!;
    const fromStock = Math.min(quantity, available);
    const craftQty = quantity - fromStock;
    remainingStock.set(item.id, available - fromStock);

    if (craftQty > 0) {
      if (item.ingredients.length === 0) {
        return {
          message: `No hay suficiente stock de ${item.name} (disponible: ${available}).`,
        };
      }
      craftNeeds.push({ item, craftQty });
    }

    lines.push({
      itemId: item.id,
      name: item.name,
      price: item.price.toString(),
      quantity,
    });
  }

  if (lines.length === 0) {
    return { message: "Selecciona al menos un producto." };
  }

  for (const { item, craftQty } of craftNeeds) {
    for (const { ingredient, quantity: perUnit } of item.ingredients) {
      const required = perUnit * craftQty;
      const available = remainingStock.get(ingredient.id)!;
      if (available < required) {
        return {
          message: `No hay suficiente stock de ${ingredient.name} para preparar ${item.name} (necesario: ${required}, disponible: ${available}).`,
        };
      }
      remainingStock.set(ingredient.id, available - required);
    }
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.price) * line.quantity,
    0
  );

  let discount: { name: string; percentage: string } | null = null;
  const discountId = formData.get("discountId");
  if (typeof discountId === "string" && discountId) {
    const found = await prisma.discount.findUnique({
      where: { id: discountId },
      select: { calculatorId: true, name: true, percentage: true },
    });
    if (found && found.calculatorId === calculatorId) {
      discount = { name: found.name, percentage: found.percentage.toString() };
    }
  }

  const total = discount
    ? Math.round(subtotal * (1 - Number(discount.percentage) / 100) * 100) / 100
    : subtotal;

  const rawNote = formData.get("note");
  const note = typeof rawNote === "string" && rawNote.trim() ? rawNote.trim().slice(0, 280) : null;

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        calculatorId,
        userId,
        subtotal,
        discountName: discount?.name,
        discountPercentage: discount?.percentage,
        total,
        note,
      },
    });

    for (const line of lines) {
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          itemId: line.itemId,
          name: line.name,
          price: line.price,
          quantity: line.quantity,
        },
      });
    }

    for (const item of items) {
      const decrement = item.stock - remainingStock.get(item.id)!;
      if (decrement !== 0) {
        await tx.item.update({
          where: { id: item.id },
          data: { stock: { decrement } },
        });
      }
    }
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/sell`);
  revalidatePath(`/dashboard/calculators/${calculatorId}/stock`);
  revalidatePath(`/dashboard/calculators/${calculatorId}/sales`);
  revalidatePath(`/dashboard/calculators/${calculatorId}`);

  const calculator = await prisma.calculator.findUnique({
    where: { id: calculatorId },
    select: { name: true, discordWebhook: { select: { webhookUrl: true } } },
  });

  if (calculator?.discordWebhook) {
    const user = await getCurrentUser();
    const displayNames = await getCalculatorDisplayNames(calculatorId);
    await sendSaleNotification(calculator.discordWebhook.webhookUrl, {
      calculatorName: calculator.name,
      userName: displayNames.get(userId) ?? user?.name ?? "Alguien",
      subtotal,
      total,
      discount,
      lines,
      note,
    });
  }

  return { message: "Venta registrada correctamente.", success: true };
}

export async function clearSalesHistory(calculatorId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    throw new Error("No tienes permiso para gestionar esta calculadora.");
  }

  await prisma.calculator.update({
    where: { id: calculatorId },
    data: { salesClearedAt: new Date() },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/sales`);
}
