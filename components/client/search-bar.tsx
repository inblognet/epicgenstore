// components/client/search-bar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { searchProducts } from "@/lib/actions/search";

// Define the shape of our search results specifically
type SearchResult = {
  id: string;
  name: string;
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  price: any | number | string;
  imageUrl: string | null;
};

export function SearchBar({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect: Waits for user to stop typing
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchProducts(query);
        // We cast the data to our SearchResult type
        setResults(data as unknown as SearchResult[]);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative flex-1 ${isMobile ? 'w-full' : 'max-w-3xl hidden md:flex'} items-center group z-50`}>
      <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
        {/* REPLACED: group-focus-within:text-yellow-500 -> group-focus-within:text-brand */}
        <div className="absolute left-4 text-zinc-400 group-focus-within:text-brand transition-colors duration-300">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>

        {/* REPLACED: bg-zinc-900 border-zinc-800 focus:border-yellow-500 focus:bg-zinc-950 -> bg-surface-card border-zinc-800/50 focus:border-brand focus:bg-surface-bg */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length > 0) setIsOpen(true); }}
          placeholder="Search computers, parts, accessories..."
          className={`w-full bg-surface-card border border-zinc-800/50 text-white rounded-full pl-12 focus:outline-none focus:border-brand focus:bg-surface-bg transition-all shadow-inner duration-300 ${isMobile ? 'h-10 pr-20 text-sm' : 'h-12 pr-28 text-base'}`}
        />

        {/* REPLACED: bg-yellow-500 hover:bg-yellow-400 -> bg-brand hover:bg-brand-hover */}
        <button type="submit" className={`absolute right-1 top-1 bottom-1 bg-brand text-black font-black rounded-full hover:bg-brand-hover active:scale-95 transition-all duration-300 ${isMobile ? 'px-4 text-xs' : 'px-6 text-sm'}`}>
          Search
        </button>
      </form>

      {/* --- LIVE PREDICTIVE DROPDOWN --- */}
      {isOpen && (
        // REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-zinc-800/50 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
          {results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto py-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  // REPLACED: hover:bg-zinc-800 border-zinc-800/50 -> hover:bg-surface-bg border-zinc-800/50
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-bg transition-colors border-b border-zinc-800/50 last:border-0"
                >
                  {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 */}
                  <div className="w-12 h-12 bg-surface-bg rounded-md border border-zinc-800/50 p-1 flex-shrink-0 transition-colors duration-300">
                    {product.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-zinc-600">NO IMG</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{product.name}</p>
                    {/* REPLACED: text-yellow-500 -> text-brand */}
                    <p className="text-xs font-black text-brand uppercase tracking-tighter transition-colors duration-300">
                      LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </Link>
              ))}
              {/* REPLACED: bg-zinc-950/50 border-zinc-800 -> bg-surface-bg border-zinc-800/50 */}
              <div className="px-4 py-3 bg-surface-bg border-t border-zinc-800/50 text-center transition-colors duration-300">
                {/* REPLACED: text-yellow-500 hover:text-yellow-400 -> text-brand hover:text-brand-hover */}
                <button onClick={handleSearchSubmit} className="text-xs font-bold text-brand hover:text-brand-hover transition-colors duration-300">
                  See all results for &quot;{query}&quot; &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-zinc-400 font-medium italic">No products found matching &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}