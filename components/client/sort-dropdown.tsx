// components/client/sort-dropdown.tsx
"use client";

import { useTransition } from "react";

export function SortDropdown({ initialSort }: { initialSort: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`relative ${isPending ? "opacity-50" : "opacity-100"} transition-opacity`}>
      <select
        name="sort"
        defaultValue={initialSort}
        // Submits the parent form the moment an option is chosen
        onChange={(e) => {
          startTransition(() => {
            e.target.form?.requestSubmit();
          });
        }}
        className="bg-surface-bg border border-theme-border text-theme-main text-xs font-bold px-3 py-2 rounded-lg focus:outline-none focus:border-brand cursor-pointer transition-colors duration-300"
      >
        <option value="newest">Sort by: Newest Arrivals</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}