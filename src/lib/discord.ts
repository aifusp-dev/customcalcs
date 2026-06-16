import { formatPrice } from "@/lib/format";

interface SaleNotificationLine {
  name: string;
  price: string;
  quantity: number;
}

interface SaleNotificationData {
  calculatorName: string;
  userName: string;
  subtotal: number;
  total: number;
  discount: { name: string; percentage: string } | null;
  lines: SaleNotificationLine[];
  note?: string | null;
}

export async function sendSaleNotification(webhookUrl: string, data: SaleNotificationData) {
  const description = data.lines
    .map((line) => `${line.quantity}x ${line.name} — ${formatPrice(Number(line.price) * line.quantity)}`)
    .join("\n");

  const fields = [{ name: "Vendido por", value: data.userName, inline: true }];

  if (data.discount) {
    fields.push(
      { name: "Subtotal", value: formatPrice(data.subtotal), inline: true },
      { name: "Descuento", value: `${data.discount.name} (-${data.discount.percentage}%)`, inline: true }
    );
  }

  fields.push({ name: "Total", value: formatPrice(data.total), inline: true });

  if (data.note) {
    fields.push({ name: "Nota", value: data.note, inline: false });
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: `Nueva venta en ${data.calculatorName}`,
            description,
            color: 0x22c55e,
            fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Error sending Discord sale notification:", error);
  }
}
