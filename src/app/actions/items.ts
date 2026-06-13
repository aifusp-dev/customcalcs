"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { ItemFormSchema, type ItemFormState } from "@/lib/definitions";

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
  if (role !== "OWNER") {
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

  if (imageFile) {
    const imageUrl = await saveItemImage(item.id, imageFile);
    await prisma.item.update({ where: { id: item.id }, data: { imageUrl } });
  }

  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function updateItem(
  calculatorId: string,
  itemId: string,
  _state: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
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
  if (imageFile) {
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
  if (role !== "OWNER") {
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
  if (role !== "OWNER" && role !== "EDITOR") {
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
