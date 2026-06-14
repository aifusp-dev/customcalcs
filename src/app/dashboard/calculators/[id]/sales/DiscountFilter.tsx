"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function DiscountFilter({ discounts }: { discounts: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      defaultValue={searchParams.get("discount") ?? ""}
      onChange={(event) => {
        const value = event.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("discount", value);
        } else {
          params.delete("discount");
        }
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
      className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
    >
      <option value="">Todos los descuentos</option>
      <option value="none">Sin descuento</option>
      {discounts.map((discount) => (
        <option key={discount} value={discount}>
          {discount}
        </option>
      ))}
    </select>
  );
}
