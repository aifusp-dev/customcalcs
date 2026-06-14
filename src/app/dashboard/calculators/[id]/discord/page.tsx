import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { UnlinkDiscordForm } from "./UnlinkDiscordForm";

export default async function CalculatorDiscordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (role !== "OWNER") notFound();

  const webhook = await prisma.discordWebhook.findUnique({
    where: { calculatorId: id },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Discord</h2>

      {webhook ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">
            Las ventas se publican en{" "}
            <span className="text-neutral-300">
              {webhook.channelName ? `#${webhook.channelName}` : "un canal"}
            </span>
            {webhook.guildName ? ` de ${webhook.guildName}` : ""}.
          </p>
          <UnlinkDiscordForm calculatorId={id} />
        </div>
      ) : (
        <div className="space-y-2 text-sm text-neutral-400">
          <p>Esta calculadora no está vinculada a ningún canal de Discord.</p>
          <p>
            Para vincularla, ejecuta <code>/registercalc</code> en tu servidor
            de Discord (en el canal donde quieras recibir las notificaciones
            de venta) y sigue el enlace que te enviará el bot.
          </p>
        </div>
      )}
    </section>
  );
}
