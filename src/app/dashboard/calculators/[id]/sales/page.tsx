import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession, getCalculatorRole, canManageCalculator } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import { getCalculatorDisplayNames } from "@/lib/displayNames";
import { SellerFilter } from "./SellerFilter";
import { DiscountFilter } from "./DiscountFilter";
import { ClearSalesButton } from "./ClearSalesButton";

export default async function SalesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ userId?: string; discount?: string; all?: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (!canManageCalculator(role) && role !== "EDITOR") notFound();

  const { userId: filterUserId, discount: filterDiscount, all } = await searchParams;
  const showAll = all === "1";

  const calculator = await prisma.calculator.findUnique({
    where: { id },
    select: { salesClearedAt: true },
  });

  const where = {
    calculatorId: id,
    ...(filterUserId ? { userId: filterUserId } : {}),
    ...(filterDiscount === "none"
      ? { discountName: null }
      : filterDiscount
        ? { discountName: filterDiscount }
        : {}),
    ...(!showAll && calculator?.salesClearedAt
      ? { createdAt: { gt: calculator.salesClearedAt } }
      : {}),
  };

  const [sales, totals, sellerRows, discountRows] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        user: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.sale.aggregate({ where, _sum: { total: true } }),
    prisma.sale.findMany({
      where: { calculatorId: id },
      select: { userId: true, user: { select: { name: true } } },
      distinct: ["userId"],
    }),
    prisma.sale.findMany({
      where: { calculatorId: id, discountName: { not: null } },
      select: { discountName: true },
      distinct: ["discountName"],
    }),
  ]);

  const displayNames = await getCalculatorDisplayNames(id);

  const sellers = sellerRows
    .map((row) => ({
      id: row.userId,
      name: displayNames.get(row.userId) ?? row.user.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const discounts = discountRows
    .map((row) => row.discountName!)
    .sort((a, b) => a.localeCompare(b));

  const totalSold = Number(totals._sum.total ?? 0);
  const filteredSellerName = filterUserId
    ? sellers.find((seller) => seller.id === filterUserId)?.name
    : null;
  const filteredDiscountLabel =
    filterDiscount === "none" ? "sin descuento" : filterDiscount ? `con "${filterDiscount}"` : null;

  const toggleAllParams = new URLSearchParams();
  if (filterUserId) toggleAllParams.set("userId", filterUserId);
  if (filterDiscount) toggleAllParams.set("discount", filterDiscount);
  if (!showAll) toggleAllParams.set("all", "1");
  const toggleAllQuery = toggleAllParams.toString();
  const toggleAllHref = `/dashboard/calculators/${id}/sales${toggleAllQuery ? `?${toggleAllQuery}` : ""}`;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Registro de ventas</h2>
          <p className="text-sm text-neutral-400">
            Últimas {sales.length} ventas registradas en esta calculadora.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SellerFilter sellers={sellers} />
          <DiscountFilter discounts={discounts} />
          {canManageCalculator(role) && <ClearSalesButton calculatorId={id} />}
        </div>
      </div>

      {calculator?.salesClearedAt && (
        <p className="text-xs text-neutral-500">
          {showAll
            ? "Mostrando el historial completo de ventas."
            : `Mostrando ventas desde la última limpieza (${formatDateTime(calculator.salesClearedAt)}).`}{" "}
          <Link href={toggleAllHref} className="underline hover:text-neutral-300">
            {showAll ? "Ver solo desde la última limpieza" : "Ver historial completo"}
          </Link>
        </p>
      )}

      <div className="border border-neutral-800 rounded-lg px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {[
            "Total vendido",
            filteredSellerName ? `por ${filteredSellerName}` : null,
            filteredDiscountLabel,
          ]
            .filter(Boolean)
            .join(" ")}
        </p>
        <p className="text-lg font-semibold">{formatPrice(totalSold)}</p>
      </div>

      {sales.length === 0 ? (
        <p className="text-sm text-neutral-400">Todavía no hay ventas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {sales.map((sale) => (
            <li key={sale.id} className="border border-neutral-800 rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    {sale.discountName && (
                      <p className="text-sm text-neutral-400 line-through">
                        {formatPrice(sale.subtotal)}
                      </p>
                    )}
                    <p className="font-medium">{formatPrice(sale.total)}</p>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {formatDateTime(sale.createdAt)} · {displayNames.get(sale.userId) ?? sale.user.name}
                    {sale.discountName && (
                      <> · {sale.discountName} (-{sale.discountPercentage?.toString()}%)</>
                    )}
                  </p>
                </div>
              </div>
              <ul className="text-sm text-neutral-300 space-y-0.5">
                {sale.items.map((line) => (
                  <li key={line.id} className="flex items-center justify-between">
                    <span>
                      {line.quantity} × {line.name}
                    </span>
                    <span className="text-neutral-400">
                      {formatPrice(Number(line.price) * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              {sale.note && (
                <p className="text-sm text-neutral-400 italic border-t border-neutral-900 pt-2">
                  {sale.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
