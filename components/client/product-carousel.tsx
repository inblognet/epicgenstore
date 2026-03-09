// components/client/product-carousel.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AddToCartButton } from "@/components/client/add-to-cart-button";
import { WishlistButton } from "@/components/client/wishlist-button";

interface CarouselProduct {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  salePrice: number | string | null;
  imageUrl: string | null;
  images?: string[]; // NEW: Added to support the secondary hover image
  stock: number;
  onSale: boolean;
  category: { name: string } | null;
}

interface ProductCarouselProps {
  title: string;
  categorySlug: string;
  products: CarouselProduct[];
  wishlistedIds: string[];
}

export function ProductCarousel({ title, categorySlug, products, wishlistedIds }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State to track if the user is hovering over the carousel
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const scrollAmount = 344; // Approx width of one card + gap

      // If scrolling right and we reached the end, loop back to the start
      if (direction === "right" && scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Otherwise, scroll normally
        const actualScrollAmount = direction === "left" ? -scrollAmount : scrollAmount;
        scrollContainerRef.current.scrollBy({ left: actualScrollAmount, behavior: "smooth" });
      }
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    // If the user is hovering, don't auto-scroll
    if (isHovered) return;

    // Scroll to the right every 4 seconds (4000 milliseconds)
    const interval = setInterval(() => {
      scroll("right");
    }, 4000);

    // Clean up the timer when the component unmounts or hover state changes
    return () => clearInterval(interval);
  }, [isHovered]);

  if (products.length === 0) return null;

  return (
    <div
      className="mb-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between bg-surface-card border border-theme-border rounded-t-2xl px-6 py-4 transition-colors duration-300">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-theme-main">
          {title}
        </h2>
        <Link
          href={`/products?category=${categorySlug}`}
          className="text-sm font-bold text-theme-muted hover:text-brand transition-colors flex items-center gap-1 uppercase tracking-wider group"
        >
          View All <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-brand transition-colors" />
        </Link>
      </div>

      {/* CAROUSEL WRAPPER */}
      <div className="relative bg-surface-bg border-x border-b border-theme-border rounded-b-2xl p-6 transition-colors duration-300">

        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-surface-card/80 hover:bg-brand text-theme-main hover:text-black border border-theme-border p-3 rounded-full shadow-xl backdrop-blur-sm transition-all hidden md:block"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 px-2 items-stretch"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

          {products.map((product) => {
            const hasHoverImage = product.images && product.images.length > 0;
            const hoverImageUrl = hasHoverImage ? product.images![0] : null;
            const activePrice = product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price);
            const installmentPrice = (activePrice / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

            return (
              // UPGRADED: Transparent, tall card matching the new style
              <div key={product.id} className="min-w-[240px] max-w-[240px] md:min-w-[280px] md:max-w-[280px] snap-start shrink-0 bg-transparent border border-theme-border rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-xl duration-300 h-auto">

                {/* UPGRADED: aspect-[4/5] and transparent bg */}
                <div className="relative aspect-[4/5] bg-transparent overflow-hidden border-b border-theme-border transition-colors duration-300 group/img shrink-0">
                  <Link href={`/product/${product.slug}`} className="absolute inset-0 p-4 md:p-6 flex items-center justify-center z-0">
                    {product.imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-contain transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-md ${
                            hasHoverImage ? 'group-hover/img:opacity-0' : ''
                          }`}
                        />
                        {hasHoverImage && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={hoverImageUrl!}
                            alt={`${product.name} alternate view`}
                            className="absolute inset-0 p-4 md:p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-500 drop-shadow-md"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-muted text-[10px] md:text-sm font-black tracking-widest uppercase text-center absolute inset-0">No Image</div>
                    )}
                  </Link>

                  <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none">
                    {product.stock > 0 ? (
                      <span className="bg-green-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">IN STOCK</span>
                    ) : (
                      <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">SOLD OUT</span>
                    )}

                    {product.onSale && (
                      <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider animate-pulse w-fit mt-0.5 md:mt-0">
                        PROMO
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 scale-90 md:scale-100 origin-top-right">
                    <WishlistButton
                      productId={product.id}
                      initialIsWishlisted={wishlistedIds.includes(product.id)}
                    />
                  </div>
                </div>

                <div className="p-4 md:p-5 flex flex-col flex-grow z-10 bg-transparent transition-colors duration-300">
                  {product.category && (
                    <span className="text-[8px] md:text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1 md:mb-2 truncate transition-colors duration-300">
                      {product.category.name}
                    </span>
                  )}

                  <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                    <h3 className="font-bold text-[11px] md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide transition-colors duration-300">{product.name}</h3>
                  </Link>

                  {/* Mock Rating */}
                  <div className="flex items-center gap-1.5 mb-3 md:mb-4">
                    <div className="flex text-theme-muted/50 text-[10px] tracking-widest">
                      ★★★★★
                    </div>
                    <span className="text-[8px] md:text-[9px] text-theme-muted">(reviews)</span>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">

                    {/* Horizontal Layout for Price and Add to Cart Button */}
                    <div className="flex items-end justify-between gap-2">
                      <div className="font-black text-sm md:text-lg text-theme-main transition-colors duration-300 leading-none">
                        <span className="text-[9px] md:text-[10px] text-theme-muted block mb-1 tracking-widest uppercase font-bold">LKR</span>
                        {product.onSale && product.salePrice ? (
                          <div className="flex flex-col">
                            <span className="text-[9px] md:text-xs text-theme-muted line-through leading-none mb-0.5">{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="text-red-500">{Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ) : (
                          <span>{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>

                      <div className="shrink-0 mt-1 md:mt-0">
                        <AddToCartButton product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: activePrice,
                          imageUrl: product.imageUrl,
                        }} isCard={true} />
                      </div>
                    </div>

                    {/* Installment Text Mockup */}
                    <div className="text-[8px] md:text-[10px] text-theme-muted font-medium mt-1">
                      or 3 X <span className="font-bold text-theme-main">LKR {installmentPrice}</span> with <span className="text-[#a855f7] font-black italic tracking-wider">KOKO</span>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-surface-card/80 hover:bg-brand text-theme-main hover:text-black border border-theme-border p-3 rounded-full shadow-xl backdrop-blur-sm transition-all hidden md:block"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}