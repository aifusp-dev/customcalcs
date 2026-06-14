"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SellerFilter({ sellers }: { sellers: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      defaultValue={searchParams.get("userId") ?? ""}
      onChange={(event) => {
        const value = event.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("userId", value);
        } else {
          params.delete("userId");
        }
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
      className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
    >
      <option value="">Todos los vendedores</option>
      {sellers.map((seller) => (
        <option key={seller.id} value={seller.id}>
          {seller.name}
        </option>
      ))}
    </select>
  );
}
