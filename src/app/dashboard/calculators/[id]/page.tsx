import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { deleteItem } from "@/app/actions/items";
import { ItemsFilter } from "./items/ItemsFilter";

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

  const [items, categoryRows] = await Promise.all([
    prisma.item.findMany({
      where: {
        calculatorId: id,
        ...(filterName ? { name: { contains: filterName, mode: "insensitive" } } : {}),
        ...(filterCategory ? { category: filterCategory } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.item.findMany({
      where: { calculatorId: id, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const categories = categoryRows.map((r) => r.category!);

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
          {canManageCalculator(role) && (
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

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          {filterName || filterCategory
            ? "No hay productos que coincidan con los filtros."
            : "Todavía no hay productos en esta calculadora."}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 border border-neutral-800 rounded-lg px-4 py-3"
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
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-neutral-400">
                  {item.category ? `${item.category} · ` : ""}
                  Stock: {item.stock}
                </p>
              </div>

              <p className="font-semibold whitespace-nowrap">
                {formatPrice(item.price)}
              </p>

              {canManageCalculator(role) && (
                <div className="flex items-center gap-2">
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
          ))}
        </ul>
      )}
    </section>
  );
}
