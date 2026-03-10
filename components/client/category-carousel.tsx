// components/client/category-carousel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface CategoryCarouselProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Separate trackers for hovering and dragging
  const isHovered = useRef(false);
  const isDragging = useRef(false);

  // React state just for UI updates (like the grabbing cursor)
  const [dragActive, setDragActive] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Track distance to prevent accidental link clicks when dragging
  const dragDistance = useRef(0);

  // Duplicate the categories to create a flawless infinite loop illusion
  const displayCategories = [...categories, ...categories, ...categories];

  // --- CONTINUOUS SMOOTH SCROLL LOGIC ---
  useEffect(() => {
    const playAnimation = () => {
      // ONLY scroll if the mouse is NOT hovering and NOT dragging
      if (scrollRef.current && !isHovered.current && !isDragging.current) {
        // Smoothly pan by 0.5 pixels per frame
        scrollRef.current.scrollLeft += 0.5;

        // INFINITE LOOP TRICK
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 3) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(playAnimation);
    };

    animationRef.current = requestAnimationFrame(playAnimation);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // --- MOUSE DRAG & HOVER LOGIC ---
  const handleMouseEnter = () => {
    isHovered.current = true;
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
    isDragging.current = false;
    setDragActive(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    setDragActive(true);
    dragDistance.current = 0;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // FIXED: Releasing the mouse should only stop dragging, it should NOT clear the hover state!
  const handleMouseUp = () => {
    isDragging.current = false;
    setDragActive(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier

    dragDistance.current = Math.abs(walk);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="mb-16 md:mb-20 container mx-auto px-4 max-w-7xl transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-theme-border pb-4 mb-8 md:mb-10 transition-colors duration-300">
          <h2 className="text-xl md:text-3xl font-black text-theme-main tracking-[0.2em] uppercase">
            ALL CATEGORIES
          </h2>
        </div>

        {/* HORIZONTAL CAROUSEL WRAPPER */}
        <div
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={() => { isHovered.current = true; }}
          onTouchEnd={() => { isHovered.current = false; }}
          className={`flex gap-4 md:gap-6 overflow-x-auto items-stretch pb-6 transition-all duration-300 ${
            dragActive ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

            {displayCategories.map((category, index) => (
                <Link
                    key={`${category.id}-${index}`}
                    href={`/products?category=${category.slug}`}
                    draggable={false} // Prevent browser's default image drag ghost
                    onClick={(e) => {
                      // Prevent navigating if the user was just swiping/dragging the carousel
                      if (dragDistance.current > 10) {
                        e.preventDefault();
                      }
                    }}
                    className="min-w-[140px] sm:min-w-[180px] md:min-w-[220px] shrink-0 flex flex-col items-center justify-center gap-4 bg-transparent border border-theme-border p-6 md:p-8 rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl hover:border-brand/50 transition-all duration-300 group h-auto"
                >
                    {/* CATEGORY IMAGE WRAPPER */}
                    <div className="aspect-square w-full max-w-[80px] sm:max-w-[100px] md:max-w-[120px] flex items-center justify-center relative transition-colors duration-300 shrink-0 pointer-events-none">
                        {category.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={category.imageUrl}
                                alt={category.name}
                                draggable={false}
                                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                            />
                        ) : (
                            <div className="text-[10px] md:text-xs text-theme-muted font-black tracking-widest uppercase text-center">No Image</div>
                        )}
                    </div>

                    {/* CATEGORY NAME */}
                    <span className="text-center font-bold text-xs md:text-sm text-theme-main group-hover:text-brand transition-colors duration-300 tracking-wider mt-auto pointer-events-none">
                        {category.name.toUpperCase()}
                    </span>
                </Link>
            ))}
        </div>
    </div>
  );
}