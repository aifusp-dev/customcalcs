import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { CreateCustomerForm } from "./CreateCustomerForm";
import { CustomerCard } from "./CustomerCard";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (role !== "OWNER" && role !== "EDITOR") notFound();

  const customers = await prisma.customer.findMany({
    where: { calculatorId: id },
    orderBy: { name: "asc" },
  });

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Crear cliente</h2>
          <p className="text-sm text-neutral-400">
            Guarda clientes y añade notas sobre ellos.
          </p>
        </div>
        <CreateCustomerForm calculatorId={id} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Clientes</h2>

        {customers.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Todavía no has creado ningún cliente.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                calculatorId={id}
                customer={{
                  id: customer.id,
                  name: customer.name,
                  notes: customer.notes,
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
