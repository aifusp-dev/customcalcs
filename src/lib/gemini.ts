import "server-only";

const DEFAULT_MODEL = "gemini-2.5-flash";

export type ParsedMenuItem = {
  name: string;
  price: number;
  category: string | null;
};

export type ParseMenuResult = {
  items: ParsedMenuItem[];
  skipped: number;
};

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          price: { type: "NUMBER" },
          category: { type: "STRING", nullable: true },
        },
        required: ["name", "price"],
      },
    },
    skipped: { type: "INTEGER" },
  },
  required: ["items", "skipped"],
};

export async function parseMenuText(
  rawText: string,
  existingCategories: string[]
): Promise<ParseMenuResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en el servidor.");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const categoriesHint = existingCategories.length
    ? `Categorías ya existentes en esta calculadora (si una sección coincide conceptualmente, reutiliza exactamente este nombre): ${existingCategories.join(", ")}.`
    : "";

  const prompt = `Eres un asistente que convierte listas de precios en texto plano a datos estructurados para una calculadora de productos.

Reglas:
- El texto está organizado en secciones. Una línea que es solo un título (sin precio) marca la "categoría" para las líneas de producto que le siguen.
- Cada línea de producto tiene el formato "NOMBRE: PRECIO", donde PRECIO es un número (puede usar punto o coma decimal).
- Extrae únicamente líneas con un precio numérico explícito. Asigna a cada producto la categoría de la sección donde aparece (usa null si no hay ninguna cabecera antes).
- Ignora por completo líneas que sean descripciones, combos o packs sin un precio numérico claro (ejemplo: "PACKS", "X3 (AGUA Y CARNE DE RES)"). Cuenta cuántas líneas de este tipo ignoraste en "skipped".
- Normaliza nombres de producto y categoría a "Formato Capitalizado" (primera letra de cada palabra en mayúscula, resto en minúsculas), sin asteriscos ni símbolos sobrantes.
${categoriesHint}

Devuelve el resultado siguiendo exactamente el esquema JSON proporcionado.

Texto a procesar:
"""
${rawText}
"""`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Error al consultar la IA (${response.status}): ${errorBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("La IA no devolvió ningún resultado.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("La respuesta de la IA no es un JSON válido.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).items)
  ) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const { items, skipped } = parsed as { items: unknown[]; skipped?: unknown };

  return {
    items: items as ParsedMenuItem[],
    skipped: typeof skipped === "number" ? skipped : 0,
  };
}
