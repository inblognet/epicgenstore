// components/client/product-card.tsx
"use client";

import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// We define the shape of the product data we expect to receive
interface ProductProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  images?: string[];
}

export function ProductCard({ product }: { product: ProductProps }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
  };

  // Check if we have at least one sub-image to use as the hover effect
  const hasHoverImage = product.images && product.images.length > 0;
  const hoverImageUrl = hasHoverImage ? product.images![0] : null;

  // Calculate a mock installment for the visual matching the reference image
  const installmentPrice = (product.price / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    // FIXED: Ensured h-full is here so cards in a grid stretch to match heights perfectly
    <div className="h-full bg-transparent border border-theme-border rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-xl duration-300">

      {/* FIXED: Changed aspect-[4/3] to aspect-[4/5] to make the image box (and the card) much taller */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-transparent border-b border-theme-border transition-colors duration-300 shrink-0">
        {product.imageUrl ? (
          <>
            {/* Main Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              // Fades out on hover IF there is a secondary image available
              className={`absolute inset-0 p-6 object-contain w-full h-full transform group-hover:scale-110 transition-all duration-500 drop-shadow-md ${
                hasHoverImage ? 'group-hover:opacity-0' : ''
              }`}
            />

            {/* Hover Image (Secondary Image) */}
            {hasHoverImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={hoverImageUrl!}
                alt={`${product.name} alternate view`}
                // Starts invisible, fades in and scales up on hover
                className="absolute inset-0 p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 drop-shadow-md"
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-theme-muted text-sm font-black tracking-widest uppercase absolute inset-0">
            No Image
          </div>
        )}
      </Link>

      <div className="p-4 md:p-5 flex flex-col flex-grow z-10 bg-transparent">
        <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
          {/* Made the title slightly more prominent for the taller layout */}
          <h3 className="font-bold text-xs md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide">{product.name}</h3>
        </Link>

        {/* Mock Rating (from image reference) */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex text-theme-muted/50 text-[10px] tracking-widest">
            ★★★★★
          </div>
          <span className="text-[9px] text-theme-muted">(reviews)</span>
        </div>

        <div className="mt-auto flex flex-col gap-3">

          {/* Horizontal Layout: Price on Left, Button on Right */}
          <div className="flex items-end justify-between gap-2">
            <div className="font-black text-sm md:text-lg text-theme-main transition-colors duration-300 leading-none">
              <span className="text-[10px] text-theme-muted block mb-1 tracking-widest uppercase font-bold">LKR</span>
              {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>

            {/* Styled like the "In Stock" button in the reference, but functional as Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white font-black text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 h-auto rounded border border-green-500/20 transition-colors duration-300 uppercase tracking-widest"
            >
              Add
            </Button>
          </div>

          {/* Installment Text Mockup */}
          <div className="text-[9px] md:text-[10px] text-theme-muted font-medium mt-1">
            or 3 X <span className="font-bold text-theme-main">LKR {installmentPrice}</span> with <span className="text-[#a855f7] font-black italic tracking-wider">KOKO</span>
          </div>

        </div>
      </div>
    </div>
  );
}