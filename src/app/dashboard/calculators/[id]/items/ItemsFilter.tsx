"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function ItemsFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        defaultValue={searchParams.get("name") ?? ""}
        onChange={(e) => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          const value = e.target.value;
          debounceRef.current = setTimeout(() => updateParam("name", value), 300);
        }}
        className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
      />
      {categories.length > 0 && (
        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
