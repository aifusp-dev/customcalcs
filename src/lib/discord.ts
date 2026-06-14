import { formatPrice } from "@/lib/format";

interface SaleNotificationLine {
  name: string;
  price: string;
  quantity: number;
}

interface SaleNotificationData {
  calculatorName: string;
  userName: string;
  total: number;
  lines: SaleNotificationLine[];
}

export async function sendSaleNotification(webhookUrl: string, data: SaleNotificationData) {
  const description = data.lines
    .map((line) => `${line.quantity}x ${line.name} — ${formatPrice(Number(line.price) * line.quantity)}`)
    .join("\n");

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
            fields: [
              { name: "Vendido por", value: data.userName, inline: true },
              { name: "Total", value: formatPrice(data.total), inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Error sending Discord sale notification:", error);
  }
}
