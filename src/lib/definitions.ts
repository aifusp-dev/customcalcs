import * as z from "zod";

export const RegisterFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({ error: "Introduce un email válido." }).trim(),
  password: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
});

export const LoginFormSchema = z.object({
  email: z.email({ error: "Introduce un email válido." }).trim(),
  password: z.string().min(1, { error: "Introduce tu contraseña." }),
});

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const CalculatorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .max(60, { error: "El nombre no puede superar los 60 caracteres." }),
});

export const CalculatorThemeFormSchema = z.object({
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, { error: "Elige un color válido." }),
});

export type CalculatorThemeFormState =
  | {
      errors?: {
        accentColor?: string[];
      };
      message?: string;
    }
  | undefined;

export type CalculatorFormState =
  | {
      errors?: {
        name?: string[];
      };
      message?: string;
    }
  | undefined;

export const ItemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "El nombre es obligatorio." })
    .max(60, { error: "El nombre no puede superar los 60 caracteres." }),
  price: z.coerce
    .number({ error: "El precio debe ser un número." })
    .nonnegative({ error: "El precio no puede ser negativo." }),
  stock: z.coerce
    .number({ error: "El stock debe ser un número." })
    .int({ error: "El stock debe ser un número entero." })
    .nonnegative({ error: "El stock no puede ser negativo." }),
  category: z
    .string()
    .trim()
    .max(40, { error: "La categoría no puede superar los 40 caracteres." })
    .optional()
    .or(z.literal("")),
});

export type ItemFormState =
  | {
      errors?: {
        name?: string[];
        price?: string[];
        stock?: string[];
        category?: string[];
        image?: string[];
      };
      message?: string;
    }
  | undefined;

export const InviteMemberFormSchema = z.object({
  email: z.email({ error: "Introduce un email válido." }).trim(),
});

export type InviteMemberFormState =
  | {
      errors?: {
        email?: string[];
      };
      message?: string;
    }
  | undefined;

export const DisplayNameFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(40, { error: "El nombre no puede superar los 40 caracteres." })
    .optional()
    .or(z.literal("")),
});

export type DisplayNameFormState =
  | {
      errors?: {
        displayName?: string[];
      };
      message?: string;
    }
  | undefined;

export type SaleFormState =
  | {
      message?: string;
      success?: boolean;
    }
  | undefined;

export const AIParsedItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "El nombre es obligatorio." })
    .max(60, { error: "El nombre no puede superar los 60 caracteres." }),
  price: z.coerce
    .number({ error: "El precio debe ser un número." })
    .nonnegative({ error: "El precio no puede ser negativo." }),
  category: z
    .string()
    .trim()
    .max(40, { error: "La categoría no puede superar los 40 caracteres." })
    .nullable()
    .optional(),
  stock: z.coerce
    .number({ error: "El stock debe ser un número." })
    .int({ error: "El stock debe ser un número entero." })
    .nonnegative({ error: "El stock no puede ser negativo." })
    .optional(),
});

export type AIParsedItem = z.infer<typeof AIParsedItemSchema>;

export type AIImportFormState =
  | {
      items?: AIParsedItem[];
      skipped?: number;
      message?: string;
    }
  | undefined;
