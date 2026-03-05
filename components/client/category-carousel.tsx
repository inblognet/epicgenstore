// components/client/category-carousel.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="mb-20 container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl font-bold mb-10 text-theme-main tracking-tight">ALL CATEGORIES</h2>

        <div className="relative">
            {/* CAROUSEL ITEMS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {currentCategories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className="flex flex-col items-center gap-4 bg-surface-card border border-theme-border p-6 rounded-3xl shadow-xl hover:border-brand transition-colors duration-300 group"
                    >
                       {/* CATEGORY IMAGE WRAPPER */}
                        <div className="aspect-[1/1] w-full flex items-center justify-center bg-surface-bg rounded-2xl p-4 overflow-hidden border border-theme-border/50 group-hover:border-brand/20 transition-colors duration-300">
                            {category.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-[120px] h-[120px] object-contain"
                                />
                            ) : (
                                <div className="text-xs text-theme-muted font-black tracking-widest uppercase">No Image</div>
                            )}
                        </div>

                        {/* CATEGORY NAME */}
                        <span className="text-center font-bold text-sm text-theme-main group-hover:text-brand transition-colors">
                            {category.name.toUpperCase()}
                        </span>
                    </Link>
                ))}
            </div>

            {/* NAVIGATION BUTTONS */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                    {/* Pagination dots based on image_5.png */}
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                currentPage === idx ? 'bg-brand w-5' : 'bg-surface-bg border border-theme-border/80'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}