// components/client/product-carousel.tsx
"use client";

// 1. NEW: Import useState and useEffect
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

  // 2. NEW: State to track if the user is hovering over the carousel
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

  // 3. NEW: Auto-scroll effect
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
    // 4. NEW: Added onMouseEnter and onMouseLeave to pause auto-scrolling
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
          className="text-sm font-bold text-theme-muted hover:text-brand transition-colors flex items-center gap-1 uppercase tracking-wider"
        >
          View All <ChevronRight className="w-4 h-4" />
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
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] max-w-[280px] md:min-w-[320px] md:max-w-[320px] snap-start shrink-0 bg-surface-bg border border-theme-border rounded-2xl overflow-hidden hover:border-brand transition-all group flex flex-col shadow-lg duration-300">

              <div className="relative aspect-[4/3] bg-surface-card/50 overflow-hidden border-b border-theme-border transition-colors duration-300 group/img">
                <Link href={`/product/${product.slug}`} className="absolute inset-0 p-6 flex items-center justify-center z-0">
                  {product.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-2xl" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-theme-muted text-sm font-black tracking-widest uppercase transition-colors duration-300">No Image</div>
                  )}
                </Link>

                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                  {product.stock > 0 ? (
                    <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-md tracking-wider">IN STOCK</span>
                  ) : (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-md tracking-wider">SOLD OUT</span>
                  )}

                  {product.onSale && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md tracking-wider animate-pulse">PROMO</span>
                  )}
                </div>

                <div className="absolute top-4 right-4 z-20">
                  <WishlistButton
                    productId={product.id}
                    initialIsWishlisted={wishlistedIds.includes(product.id)}
                  />
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow z-10 bg-surface-bg transition-colors duration-300">
                {product.category && (
                  <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-2 transition-colors duration-300">
                    {product.category.name}
                  </span>
                )}

                <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                  <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-3 text-theme-main transition-colors duration-300">{product.name}</h3>
                </Link>

                <div className="mt-auto pt-4 flex flex-col gap-4">
                  <div className="font-black text-xl">
                    {product.onSale && product.salePrice ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-theme-muted line-through transition-colors duration-300">Rs. {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className="text-red-500">Rs. {Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ) : (
                      <span className="text-brand transition-colors duration-300">Rs. {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    )}
                  </div>

                  <AddToCartButton product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price),
                    imageUrl: product.imageUrl,
                  }} isCard={true} />
                </div>
              </div>

            </div>
          ))}
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