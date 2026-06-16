"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import * as z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import {
  ItemFormSchema,
  type ItemFormState,
  AIParsedItemSchema,
  type AIImportFormState,
  AILinkResultSchema,
  type AILinkFormState,
} from "@/lib/definitions";
import { parseMenuText, parseLinkingInstruction } from "@/lib/gemini";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "items");

function extensionFor(file: File) {
  const fromName = path.extname(file.name);
  if (fromName) return fromName.toLowerCase();
  return file.type === "image/png" ? ".png" : ".jpg";
}

async function saveItemImage(itemId: string, file: File) {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${itemId}-${Date.now()}${extensionFor(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/items/${filename}`;
}

async function deleteItemImage(imageUrl: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/items/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", imageUrl));
  } catch {
    // El archivo ya no existe; no hay nada que limpiar.
  }
}

function validateImage(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_SIZE) return "La imagen no puede superar los 5MB.";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Formato de imagen no soportado (usa PNG, JPG, WEBP o GIF).";
  }
  return null;
}

export async function createItem(
  calculatorId: string,
  _state: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para añadir productos a esta calculadora." };
  }

  const validatedFields = ItemFormSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const image = formData.get("image");
  const imageFile = image instanceof File ? image : null;
  const imageError = validateImage(imageFile);
  if (imageError) {
    return { errors: { image: [imageError] } };
  }

  const { name, price, stock, category } = validatedFields.data;

  const item = await prisma.item.create({
    data: {
      calculatorId,
      name,
      price,
      stock,
      category: category || null,
    },
    select: { id: true },
  });

  if (imageFile && imageFile.size > 0) {
    const imageUrl = await saveItemImage(item.id, imageFile);
    await prisma.item.update({ where: { id: item.id }, data: { imageUrl } });
  }

  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  redirect(`/dashboard/calculators/${calculatorId}/items/${item.id}/edit`);
}

export async function updateItem(
  calculatorId: string,
  itemId: string,
  _state: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para editar productos de esta calculadora." };
  }

  const validatedFields = ItemFormSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const image = formData.get("image");
  const imageFile = image instanceof File ? image : null;
  const imageError = validateImage(imageFile);
  if (imageError) {
    return { errors: { image: [imageError] } };
  }

  const { name, price, stock, category } = validatedFields.data;

  const existing = await prisma.item.findUnique({
    where: { id: itemId },
    select: { imageUrl: true, calculatorId: true },
  });
  if (!existing || existing.calculatorId !== calculatorId) {
    return { message: "Producto no encontrado." };
  }

  let imageUrl = existing.imageUrl;
  if (imageFile && imageFile.size > 0) {
    await deleteItemImage(existing.imageUrl);
    imageUrl = await saveItemImage(itemId, imageFile);
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { name, price, stock, category: category || null, imageUrl },
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function deleteItem(calculatorId: string, itemId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    throw new Error("No tienes permiso para eliminar productos de esta calculadora.");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { imageUrl: true, calculatorId: true },
  });
  if (!item || item.calculatorId !== calculatorId) {
    throw new Error("Producto no encontrado.");
  }

  await prisma.item.delete({ where: { id: itemId } });
  await deleteItemImage(item.imageUrl);

  revalidatePath(`/dashboard/calculators/${calculatorId}`);
}

export async function setItemStock(
  calculatorId: string,
  itemId: string,
  formData: FormData
) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role) && role !== "EDITOR") {
    throw new Error("No tienes permiso para gestionar el stock de esta calculadora.");
  }

  const stock = Number(formData.get("stock"));
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("El stock debe ser un número entero no negativo.");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { calculatorId: true },
  });
  if (!item || item.calculatorId !== calculatorId) {
    throw new Error("Producto no encontrado.");
  }

  await prisma.item.update({ where: { id: itemId }, data: { stock } });

  revalidatePath(`/dashboard/calculators/${calculatorId}/stock`);
  revalidatePath(`/dashboard/calculators/${calculatorId}`);
}

export async function parseItemsWithAI(
  calculatorId: string,
  _state: AIImportFormState,
  formData: FormData
): Promise<AIImportFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para importar productos en esta calculadora." };
  }

  const text = formData.get("text");
  if (typeof text !== "string" || !text.trim()) {
    return { message: "Pega el listado de productos antes de generar." };
  }

  const existingCategories = await prisma.item.findMany({
    where: { calculatorId, category: { not: null } },
    distinct: ["category"],
    select: { category: true },
  });

  try {
    const result = await parseMenuText(
      text,
      existingCategories.map((c) => c.category!).filter(Boolean)
    );

    const validated = z.array(AIParsedItemSchema).safeParse(result.items);
    if (!validated.success) {
      return { message: "La IA devolvió datos con un formato inesperado. Inténtalo de nuevo." };
    }

    if (validated.data.length === 0) {
      return {
        message: "No se encontraron productos con precio en el texto proporcionado.",
        skipped: result.skipped,
      };
    }

    return { items: validated.data, skipped: result.skipped };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Error al consultar la IA." };
  }
}

export async function importItemsBulk(
  calculatorId: string,
  _state: AIImportFormState,
  formData: FormData
): Promise<AIImportFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para importar productos en esta calculadora." };
  }

  const raw = formData.get("items");
  if (typeof raw !== "string") {
    return { message: "No hay productos para importar." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { message: "Datos de importación inválidos." };
  }

  const validated = z.array(AIParsedItemSchema).safeParse(parsed);
  if (!validated.success || validated.data.length === 0) {
    return { message: "No hay productos válidos para importar." };
  }

  await prisma.item.createMany({
    data: validated.data.map((item) => ({
      calculatorId,
      name: item.name,
      price: item.price,
      category: item.category || null,
      stock: item.stock ?? 0,
    })),
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function parseLinkWithAI(
  calculatorId: string,
  _state: AILinkFormState,
  formData: FormData
): Promise<AILinkFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para gestionar esta calculadora." };
  }

  const instruction = formData.get("instruction");
  if (typeof instruction !== "string" || !instruction.trim()) {
    return { message: "Escribe una instrucción antes de continuar." };
  }

  const existingItems = await prisma.item.findMany({
    where: { calculatorId },
    select: { name: true, category: true },
    orderBy: { name: "asc" },
  });

  try {
    const raw = await parseLinkingInstruction(instruction, existingItems);
    const validated = AILinkResultSchema.safeParse(raw);
    if (!validated.success) {
      return { message: "La IA devolvió datos con formato inesperado. Inténtalo de nuevo." };
    }
    return { result: validated.data };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Error al consultar la IA." };
  }
}

const ApplyVinculoSchema = z.object({
  nombreProducto: z.string().trim().min(1),
  existente: z.boolean(),
  precio: z.coerce.number().nonnegative(),
  categoria: z.string().trim().nullable().optional(),
  cantidad: z.coerce.number().int().positive(),
});

export async function applyLinking(
  calculatorId: string,
  _state: AILinkFormState,
  formData: FormData
): Promise<AILinkFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (!canManageCalculator(role)) {
    return { message: "No tienes permiso para gestionar esta calculadora." };
  }

  const mpNombre = formData.get("mp_nombre");
  const mpCategoria = formData.get("mp_categoria");
  const mpPrecio = Number(formData.get("mp_precio") ?? 0);
  const mpStock = Number(formData.get("mp_stock") ?? 0);

  if (typeof mpNombre !== "string" || !mpNombre.trim()) {
    return { message: "El nombre de la materia prima es obligatorio." };
  }
  if (!Number.isFinite(mpPrecio) || mpPrecio < 0) {
    return { message: "El precio de la materia prima no es válido." };
  }
  if (!Number.isInteger(mpStock) || mpStock < 0) {
    return { message: "El stock inicial de la materia prima no es válido." };
  }

  const rawVinculos = formData.get("vinculos");
  if (typeof rawVinculos !== "string") return { message: "No hay vínculos para aplicar." };

  let parsedVinculos: unknown;
  try {
    parsedVinculos = JSON.parse(rawVinculos);
  } catch {
    return { message: "Datos de vínculos inválidos." };
  }

  const validatedVinculos = z.array(ApplyVinculoSchema).min(1).safeParse(parsedVinculos);
  if (!validatedVinculos.success) return { message: "No hay vínculos válidos para aplicar." };

  const existingItems = await prisma.item.findMany({
    where: { calculatorId },
    select: { id: true, name: true },
  });

  const findExisting = (name: string) =>
    existingItems.find((i) => i.name.toLowerCase() === name.toLowerCase());

  await prisma.$transaction(async (tx) => {
    const mp = await tx.item.create({
      data: {
        calculatorId,
        name: mpNombre.trim(),
        category:
          typeof mpCategoria === "string" && mpCategoria.trim() ? mpCategoria.trim() : null,
        price: mpPrecio,
        stock: mpStock,
      },
      select: { id: true },
    });

    for (const vinculo of validatedVinculos.data) {
      let itemId: string;
      const existing = findExisting(vinculo.nombreProducto);

      if (existing) {
        itemId = existing.id;
      } else {
        const created = await tx.item.create({
          data: {
            calculatorId,
            name: vinculo.nombreProducto,
            category: vinculo.categoria ?? null,
            price: vinculo.precio,
            stock: 0,
          },
          select: { id: true },
        });
        itemId = created.id;
      }

      await tx.itemIngredient.upsert({
        where: { itemId_ingredientId: { itemId, ingredientId: mp.id } },
        create: { itemId, ingredientId: mp.id, quantity: vinculo.cantidad },
        update: { quantity: vinculo.cantidad },
      });
    }
  });

  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  redirect(`/dashboard/calculators/${calculatorId}`);
}
