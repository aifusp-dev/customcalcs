export function formatPrice(value: number | string | { toString(): string }) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value.toString()));
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}
