// components/client/category-carousel.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface CategoryCarouselProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }[];
}

const ITEMS_PER_PAGE = 5;

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Simple client-side pagination for brevity
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCategories = categories.slice(startIndex, endIndex);

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  return (
    <div className="mb-16 md:mb-20 container mx-auto px-4 max-w-7xl transition-colors duration-300">
        <div className="flex items-center justify-between border-b-4 border-theme-border pb-4 md:pb-6 mb-8 md:mb-10 transition-colors duration-300">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-theme-main tracking-tighter uppercase transition-colors duration-300">
            ALL CATEGORIES
          </h2>
        </div>

        <div className="relative">
            {/* CAROUSEL ITEMS */}
            {/* UPGRADED: Adjusted gaps and sizing for a sleeker grid layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 items-stretch">
                {currentCategories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        // UPGRADED: Transparent backgrounds, border-based frames, and matching hover shadows
                        className="flex flex-col items-center justify-center gap-4 bg-transparent border border-theme-border p-6 md:p-8 rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl hover:border-brand/50 transition-all duration-300 group h-full"
                    >
                        {/* CATEGORY IMAGE WRAPPER */}
                        {/* UPGRADED: Removed solid background, added image scaling on hover */}
                        <div className="aspect-square w-full max-w-[100px] md:max-w-[140px] flex items-center justify-center relative transition-colors duration-300 shrink-0">
                            {category.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                />
                            ) : (
                                <div className="text-[10px] md:text-xs text-theme-muted font-black tracking-widest uppercase text-center">No Image</div>
                            )}
                        </div>

                        {/* CATEGORY NAME */}
                        <span className="text-center font-bold text-xs md:text-sm text-theme-main group-hover:text-brand transition-colors duration-300 tracking-wider mt-auto">
                            {category.name.toUpperCase()}
                        </span>
                    </Link>
                ))}
            </div>

            {/* NAVIGATION BUTTONS */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 md:gap-3 mt-8 md:mt-10">
                    {/* Pagination dots */}
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx)}
                            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                                currentPage === idx
                                  ? 'bg-brand w-6 md:w-8'
                                  : 'bg-theme-border hover:bg-theme-muted w-1.5 md:w-2'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}