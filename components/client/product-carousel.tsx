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
  images?: string[];
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Interaction refs (keeps the animation loop up to date)
  const isHovered = useRef(false);
  const isDragging = useRef(false);

  // UI state for cursor changes
  const [dragActive, setDragActive] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistance = useRef(0);

  // Duplicate products for infinite looping
  // If there are very few products, we duplicate them more times so the container is wide enough
  const loopCount = products.length < 4 ? 6 : 3;
  const displayProducts = Array(loopCount).fill(products).flat();

  // --- CONTINUOUS SMOOTH SCROLL LOGIC ---
  useEffect(() => {
    // If there aren't enough products to warrant scrolling, don't animate
    if (products.length < 2) return;

    const playAnimation = () => {
      if (scrollRef.current && !isHovered.current && !isDragging.current) {
        // Scroll speed (adjust this to make it faster/slower)
        scrollRef.current.scrollLeft += 0.8;

        // Infinite loop trick: reset when we've scrolled exactly one original set's width
        const scrollWidth = scrollRef.current.scrollWidth;
        const resetPoint = scrollWidth / loopCount;

        if (scrollRef.current.scrollLeft >= resetPoint) {
          scrollRef.current.scrollLeft -= resetPoint;
        }
      }
      animationRef.current = requestAnimationFrame(playAnimation);
    };

    animationRef.current = requestAnimationFrame(playAnimation);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [products.length, loopCount]);

  // --- ARROW BUTTON SCROLLING ---
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Width of one card + gap
      const newScrollLeft = direction === "left"
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  // --- MOUSE DRAG LOGIC ---
  const handleMouseEnter = () => { isHovered.current = true; };

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

  const handleMouseUp = () => {
    isDragging.current = false;
    setDragActive(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;

    dragDistance.current = Math.abs(walk);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (products.length === 0) return null;

  return (
    <div
      className="mb-16"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      <div className="relative bg-surface-bg border-x border-b border-theme-border rounded-b-2xl p-6 transition-colors duration-300 overflow-hidden">

        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-surface-card/80 hover:bg-brand text-theme-main hover:text-black border border-theme-border p-3 rounded-full shadow-xl backdrop-blur-sm transition-all hidden md:block"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container (Removed snap-x for smooth auto-scrolling) */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={() => { isHovered.current = true; }}
          onTouchEnd={() => { isHovered.current = false; }}
          className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-2 px-2 items-stretch transition-all duration-300 ${
            dragActive ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

          {displayProducts.map((product, index) => {
            const hasHoverImage = product.images && product.images.length > 0;
            const hoverImageUrl = hasHoverImage ? product.images![0] : null;
            const activePrice = product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price);
            const installmentPrice = (activePrice / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

            return (
              <div
                key={`${product.id}-${index}`}
                className="min-w-[240px] max-w-[240px] md:min-w-[280px] md:max-w-[280px] shrink-0 bg-transparent border border-theme-border rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-xl duration-300 h-auto"
              >
                <Link
                  href={`/product/${product.slug}`}
                  draggable={false}
                  onClick={(e) => {
                    if (dragDistance.current > 10) e.preventDefault();
                  }}
                  className="block relative aspect-[4/5] bg-transparent overflow-hidden border-b border-theme-border transition-colors duration-300 group/img shrink-0"
                >
                  {product.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        draggable={false}
                        className={`w-full h-full object-contain transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-md ${
                          hasHoverImage ? 'group-hover/img:opacity-0' : ''
                        }`}
                      />
                      {hasHoverImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={hoverImageUrl!}
                          alt={`${product.name} alternate view`}
                          draggable={false}
                          className="absolute inset-0 p-4 md:p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-500 drop-shadow-md"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-theme-muted text-[10px] md:text-sm font-black tracking-widest uppercase text-center absolute inset-0">No Image</div>
                  )}

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
                </Link>

                <div className="p-4 md:p-5 flex flex-col flex-grow z-10 bg-transparent transition-colors duration-300">
                  {product.category && (
                    <span className="text-[8px] md:text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1 md:mb-2 truncate transition-colors duration-300 pointer-events-none">
                      {product.category.name}
                    </span>
                  )}

                  <Link
                    href={`/product/${product.slug}`}
                    draggable={false}
                    onClick={(e) => {
                      if (dragDistance.current > 10) e.preventDefault();
                    }}
                    className="hover:text-brand transition-colors duration-300"
                  >
                    <h3 className="font-bold text-[11px] md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide transition-colors duration-300">{product.name}</h3>
                  </Link>

                  {/* Mock Rating */}
                  <div className="flex items-center gap-1.5 mb-3 md:mb-4 pointer-events-none">
                    <div className="flex text-theme-muted/50 text-[10px] tracking-widest">
                      ★★★★★
                    </div>
                    <span className="text-[8px] md:text-[9px] text-theme-muted">(reviews)</span>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-end justify-between gap-2 pointer-events-none">
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

                      <div className="shrink-0 mt-1 md:mt-0 pointer-events-auto">
                        <AddToCartButton product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: activePrice,
                          imageUrl: product.imageUrl,
                        }} isCard={true} />
                      </div>
                    </div>

                    <div className="text-[8px] md:text-[10px] text-theme-muted font-medium mt-1 pointer-events-none">
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