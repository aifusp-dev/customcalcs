import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { deleteItem } from "@/app/actions/items";

export default async function CalculatorItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!role) notFound();

  const items = await prisma.item.findMany({
    where: { calculatorId: id },
    orderBy: { createdAt: "desc" },
  });

  const formatPrice = (value: { toString(): string }) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(Number(value.toString()));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Productos</h2>
        {role === "OWNER" && (
          <Link
            href={`/dashboard/calculators/${id}/items/new`}
            className="text-sm bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Añadir producto
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Todavía no hay productos en esta calculadora.
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

              {role === "OWNER" && (
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
