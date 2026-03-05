// components/client/product-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
// FIXED: Imported useRef
import { useState, useEffect, useRef } from "react";
import { getDynamicTags } from "@/lib/actions/tags";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  _count: { products: number };
}

interface Tag {
  id: string;
  title: string;
  name: string;
  slug: string;
  _count: { products: number };
}

const SLIDER_MAX = 500000;

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategories = searchParams.get("category")?.split(",") || [];
  const activeTags = searchParams.get("tag")?.split(",") || [];
  const urlMin = searchParams.get("minPrice") || "";
  const urlMax = searchParams.get("maxPrice") || "";
  const searchQuery = searchParams.get("search") || "";

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localMin, setLocalMin] = useState(urlMin);
  const [localMax, setLocalMax] = useState(urlMax);

  // --- FIXED: Ref to track what we just pushed to the URL so we don't overwrite the user's active typing ---
  const lastPushed = useRef({ search: searchQuery, min: urlMin, max: urlMax });

  const [dynamicTags, setDynamicTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function fetchContextualTags() {
      if (activeCategories.length > 0) {
        const tags = await getDynamicTags(activeCategories);
        setDynamicTags(tags);
      } else {
        setDynamicTags([]);
      }
    }

    fetchContextualTags();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("category")]);

  // --- FIXED: Only sync URL changes to local state if they changed externally (e.g. Browser Back Button) ---
  useEffect(() => {
    if (urlMin !== lastPushed.current.min) {
      setLocalMin(urlMin);
      lastPushed.current.min = urlMin;
    }
    if (urlMax !== lastPushed.current.max) {
      setLocalMax(urlMax);
      lastPushed.current.max = urlMax;
    }
    if (searchQuery !== lastPushed.current.search) {
      setLocalSearch(searchQuery);
      lastPushed.current.search = searchQuery;
    }
  }, [urlMin, urlMax, searchQuery]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        // Mark this value as "pushed" so the sync effect above ignores it!
        lastPushed.current.search = localSearch;
        updateFilters({ search: localSearch || null });
      }
    }, 400);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const toggleCategory = (slug: string) => {
    let newCategories = [...activeCategories];
    if (newCategories.includes(slug)) {
      newCategories = newCategories.filter((c) => c !== slug);
    } else {
      newCategories.push(slug);
    }
    updateFilters({
      category: newCategories.length > 0 ? newCategories.join(",") : null,
      tag: null
    });
  };

  const toggleTag = (slug: string) => {
    let newTags = [...activeTags];
    if (newTags.includes(slug)) {
      newTags = newTags.filter((t) => t !== slug);
    } else {
      newTags.push(slug);
    }
    updateFilters({ tag: newTags.length > 0 ? newTags.join(",") : null });
  };

  const applyPriceFilter = () => {
    lastPushed.current.min = localMin;
    lastPushed.current.max = localMax;
    updateFilters({ minPrice: localMin || null, maxPrice: localMax || null });
  };

  const clearAll = () => {
    setLocalSearch("");
    setLocalMin("");
    setLocalMax("");
    lastPushed.current = { search: "", min: "", max: "" };
    router.push("/products", { scroll: false });
  };

  const minVal = Number(localMin) || 0;
  const maxVal = localMax ? Number(localMax) : SLIDER_MAX;
  const leftPercent = Math.min(100, Math.max(0, (minVal / SLIDER_MAX) * 100));
  const rightPercent = Math.min(100, Math.max(0, 100 - (maxVal / SLIDER_MAX) * 100));

  const parentCategories = categories.filter(c =>
    c.parentId === null && categories.some(child => child.parentId === c.id)
  );

  const standaloneCategories = categories.filter(c =>
    c.parentId === null && !categories.some(child => child.parentId === c.id)
  );

  const CategoryCheckbox = ({ category }: { category: Category }) => (
    <div
      key={category.id}
      onClick={() => toggleCategory(category.slug)}
      className="flex items-center justify-between cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all duration-300 ${activeCategories.includes(category.slug) ? 'bg-brand border-brand' : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'}`}>
          {activeCategories.includes(category.slug) && (
            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${activeCategories.includes(category.slug) ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
          {category.name}
        </span>
      </div>
      <span className="text-[10px] font-bold bg-surface-bg border border-zinc-800/80 text-zinc-500 px-2.5 py-1 rounded-md transition-colors duration-300">
        {category._count.products}
      </span>
    </div>
  );

  return (
    <aside className="w-full md:w-80 flex-shrink-0 md:sticky md:top-32 bg-surface-card border border-zinc-800/50 rounded-2xl p-6 shadow-2xl transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
          <span className="w-2 h-2 bg-brand rounded-full transition-colors duration-300"></span> Filters
        </h2>
        <button onClick={clearAll} className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
          Clear All
        </button>
      </div>

      <div className="mb-10">
        <h3 className="text-sm font-bold text-zinc-300 mb-3">Search Products</h3>
        <div className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, code..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>
      </div>

      {dynamicTags.length > 0 && (
        <div className="space-y-10 mb-10 border-b border-zinc-800/50 pb-8">
          {Object.entries(
            dynamicTags.reduce((acc, tag) => {
              const groupTitle = tag.title || "OTHER TAGS";
              if (!acc[groupTitle]) acc[groupTitle] = [];
              acc[groupTitle].push(tag);
              return acc;
            }, {} as Record<string, Tag[]>)
          ).map(([groupTitle, tagsInGroup]) => (

            <div key={groupTitle}>
              <h3 className="text-sm font-bold text-zinc-400 tracking-wide mb-4 uppercase">{groupTitle}</h3>

              <div className="space-y-4">
                {tagsInGroup.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => toggleTag(tag.slug)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all duration-300 ${activeTags.includes(tag.slug) ? 'bg-brand border-brand' : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'}`}>
                        {activeTags.includes(tag.slug) && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${activeTags.includes(tag.slug) ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                        {tag.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-surface-bg border border-zinc-800/80 text-zinc-500 px-2.5 py-1 rounded-md transition-colors duration-300">
                      {tag._count.products}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          ))}
        </div>
      )}

      {/* PRICE RANGE SECTION */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-zinc-200 tracking-wide">Price Range</h3>
          <button
            onClick={() => { setLocalMin(""); setLocalMax(""); lastPushed.current.min = ""; lastPushed.current.max = ""; updateFilters({ minPrice: null, maxPrice: null }); }}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="bg-surface-bg border border-zinc-800 rounded-xl p-4 flex items-center justify-between mb-8 shadow-inner transition-colors duration-300">
          <div className="flex-1 text-center">
            <span className="text-[11px] text-zinc-500 block mb-1">From</span>
            <span className="font-bold text-white text-sm">Rs. {minVal.toLocaleString('en-US')}</span>
          </div>
          <div className="w-px h-10 bg-zinc-800 mx-2"></div>
          <div className="flex-1 text-center">
            <span className="text-[11px] text-zinc-500 block mb-1">To</span>
            <span className="font-bold text-white text-sm">Rs. {maxVal.toLocaleString('en-US')}</span>
          </div>
        </div>

        <div className="relative w-full h-1.5 bg-zinc-800 rounded-full mb-8">
          <div
            className="absolute h-full bg-brand rounded-full transition-colors duration-300"
            style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max={SLIDER_MAX}
            step="1000"
            value={minVal}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), maxVal - 1000);
              setLocalMin(val.toString());
            }}
            onMouseUp={applyPriceFilter}
            onTouchEnd={applyPriceFilter}
            className="absolute w-full h-1.5 appearance-none pointer-events-none bg-transparent
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[4px]
              [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
          />
          <input
            type="range"
            min="0"
            max={SLIDER_MAX}
            step="1000"
            value={maxVal}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), minVal + 1000);
              setLocalMax(val.toString());
            }}
            onMouseUp={applyPriceFilter}
            onTouchEnd={applyPriceFilter}
            className="absolute w-full h-1.5 appearance-none pointer-events-none bg-transparent
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[4px]
              [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
          />
        </div>

        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">Rs.</span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="w-full bg-surface-bg border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm font-bold text-white focus:border-brand/50 outline-none transition-colors duration-300"
            />
          </div>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">Rs.</span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="w-full bg-surface-bg border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm font-bold text-white focus:border-brand/50 outline-none transition-colors duration-300"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-zinc-500 mb-1">Quick filters:</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setLocalMin("0"); setLocalMax("50000"); lastPushed.current.min = "0"; lastPushed.current.max = "50000"; updateFilters({ minPrice: "0", maxPrice: "50000" }); }} className="text-xs bg-surface-bg border border-zinc-800 hover:border-zinc-600 text-zinc-300 px-4 py-1.5 rounded-lg transition-all shadow-sm">Under 50k</button>
            <button onClick={() => { setLocalMin("50000"); setLocalMax("100000"); lastPushed.current.min = "50000"; lastPushed.current.max = "100000"; updateFilters({ minPrice: "50000", maxPrice: "100000" }); }} className="text-xs bg-surface-bg border border-zinc-800 hover:border-zinc-600 text-zinc-300 px-4 py-1.5 rounded-lg transition-all shadow-sm">50k - 100k</button>
            <button onClick={() => { setLocalMin("100000"); setLocalMax(""); lastPushed.current.min = "100000"; lastPushed.current.max = ""; updateFilters({ minPrice: "100000", maxPrice: null }); }} className="text-xs bg-surface-bg border border-zinc-800 hover:border-zinc-600 text-zinc-300 px-4 py-1.5 rounded-lg transition-all shadow-sm mt-1">Above 100k</button>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <h3 className="text-sm font-bold text-zinc-200 tracking-wide mb-5 uppercase border-b border-zinc-800 pb-2">Filter by Categories</h3>

        {parentCategories.map(parent => (
          <div key={parent.id}>
            <h3 className="text-sm font-bold text-zinc-400 tracking-wide mb-4 uppercase">{parent.name}</h3>
            <div className="space-y-4">
              {categories.filter(c => c.parentId === parent.id).map(child => (
                <CategoryCheckbox key={child.id} category={child} />
              ))}
            </div>
          </div>
        ))}

        {standaloneCategories.length > 0 && (
          <div className="pt-4 border-t border-zinc-800/50">
            <h3 className="text-sm font-bold text-zinc-400 tracking-wide mb-4 uppercase">
              {parentCategories.length > 0 ? "OTHER CATEGORIES" : "CATEGORIES"}
            </h3>
            <div className="space-y-4">
              {standaloneCategories.map((category) => (
                <CategoryCheckbox key={category.id} category={category} />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}