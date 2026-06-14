"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { DiscountFormSchema, type DiscountFormState } from "@/lib/definitions";

export async function createDiscount(
  calculatorId: string,
  _state: DiscountFormState,
  formData: FormData
): Promise<DiscountFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    return { message: "No tienes permiso para gestionar descuentos en esta calculadora." };
  }

  const validatedFields = DiscountFormSchema.safeParse({
    name: formData.get("name"),
    percentage: formData.get("percentage"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, percentage } = validatedFields.data;

  await prisma.discount.create({
    data: { calculatorId, name, percentage },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}/discounts`);
  revalidatePath(`/dashboard/calculators/${calculatorId}/sell`);
}

export async function deleteDiscount(calculatorId: string, discountId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    throw new Error("No tienes permiso para gestionar descuentos en esta calculadora.");
  }

  const discount = await prisma.discount.findUnique({
    where: { id: discountId },
    select: { calculatorId: true },
  });
  if (!discount || discount.calculatorId !== calculatorId) {
    throw new Error("Descuento no encontrado.");
  }

  await prisma.discount.delete({ where: { id: discountId } });

  revalidatePath(`/dashboard/calculators/${calculatorId}/discounts`);
  revalidatePath(`/dashboard/calculators/${calculatorId}/sell`);
}
