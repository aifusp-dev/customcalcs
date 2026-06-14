"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole, getCurrentUser } from "@/lib/dal";
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

  const items = await prisma.item.findMany({ where: { calculatorId } });

  const lines: { itemId: string; name: string; price: string; stock: number; quantity: number }[] = [];
  for (const item of items) {
    const raw = formData.get(`quantity-${item.id}`);
    const quantity = Number(raw ?? 0);
    if (quantity > 0) {
      if (!Number.isInteger(quantity)) {
        return { message: `Cantidad no válida para ${item.name}.` };
      }
      if (quantity > item.stock) {
        return {
          message: `No hay suficiente stock de ${item.name} (disponible: ${item.stock}).`,
        };
      }
      lines.push({
        itemId: item.id,
        name: item.name,
        price: item.price.toString(),
        stock: item.stock,
        quantity,
      });
    }
  }

  if (lines.length === 0) {
    return { message: "Selecciona al menos un producto." };
  }

  const total = lines.reduce(
    (sum, line) => sum + Number(line.price) * line.quantity,
    0
  );

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: { calculatorId, userId, total },
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
      await tx.item.update({
        where: { id: line.itemId },
        data: { stock: { decrement: line.quantity } },
      });
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
      total,
      lines,
    });
  }

  return { message: "Venta registrada correctamente.", success: true };
}
