import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { deleteItem, toggleItemHidden } from "@/app/actions/items";
import { ItemsFilter } from "./items/ItemsFilter";

function parseJsonStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((i) => typeof i === "string")) return parsed;
  } catch {}
  return [];
}

export default async function CalculatorItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; category?: string }>;
}) {
  const { id } = await params;
  const { name: filterName, category: filterCategory } = await searchParams;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!role) notFound();

  const isManager = canManageCalculator(role);

  const [items, categoryRows, calculatorData] = await Promise.all([
    prisma.item.findMany({
      where: {
        calculatorId: id,
        ...(filterName ? { name: { contains: filterName, mode: "insensitive" } } : {}),
        ...(filterCategory ? { category: filterCategory } : {}),
        ...(!isManager ? { hidden: false } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.item.findMany({
      where: { calculatorId: id, category: { not: null }, ...(!isManager ? { hidden: false } : {}) },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.calculator.findUnique({
      where: { id },
      select: { hiddenCategories: true },
    }),
  ]);

  const categories = categoryRows.map((r) => r.category!);
  const hiddenCategories = parseJsonStringArray(calculatorData?.hiddenCategories ?? null);

  const isItemEffectivelyHidden = (item: { hidden: boolean; category: string | null }) =>
    item.hidden || (item.category !== null && hiddenCategories.includes(item.category));

  const visibleItems = isManager
    ? items
    : items.filter((item) => !isItemEffectivelyHidden(item));

  const formatPrice = (value: { toString(): string }) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(Number(value.toString()));

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Productos</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <ItemsFilter categories={categories} />
          {isManager && (
            <>
              <Link
                href={`/dashboard/calculators/${id}/items/import`}
                className="text-sm border border-neutral-800 rounded-lg px-4 py-2 hover:bg-neutral-900 transition-colors"
              >
                Importar con IA
              </Link>
              <Link
                href={`/dashboard/calculators/${id}/items/new`}
                className="text-sm bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Añadir producto
              </Link>
            </>
          )}
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="text-sm text-neutral-400">
          {filterName || filterCategory
            ? "No hay productos que coincidan con los filtros."
            : "Todavía no hay productos en esta calculadora."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const effectivelyHidden = isItemEffectivelyHidden(item);
            return (
              <li
                key={item.id}
                className={`flex items-center gap-4 border border-neutral-800 rounded-lg px-4 py-3 ${effectivelyHidden ? "opacity-50" : ""}`}
              >
                <div className="h-12 w-12 flex-shrink-0 rounded-md bg-neutral-900 overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-neutral-600">Sin foto</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.name}</p>
                    {isManager && effectivelyHidden && (
                      <span className="text-xs text-neutral-500 border border-neutral-700 rounded px-1.5 py-0.5 whitespace-nowrap">
                        Oculto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">
                    {item.category ? `${item.category} · ` : ""}
                    Stock: {item.stock}
                  </p>
                </div>

                <p className="font-semibold whitespace-nowrap">
                  {formatPrice(item.price)}
                </p>

                {isManager && (
                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await toggleItemHidden(id, item.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 hover:bg-neutral-900 transition-colors"
                      >
                        {item.hidden ? "Mostrar" : "Ocultar"}
                      </button>
                    </form>
                    <Link
                      href={`/dashboard/calculators/${id}/items/${item.id}/edit`}
                      className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 hover:bg-neutral-900 transition-colors"
                    >
                      Editar
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteItem(id, item.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 text-red-400 hover:bg-neutral-900 transition-colors"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
