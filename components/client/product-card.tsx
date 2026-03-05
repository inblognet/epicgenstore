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
  images?: string[]; // --- NEW: Added the sub-images array ---
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

  return (
    <div className="bg-surface-bg border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-lg duration-300">

      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-surface-card/50 border-b border-zinc-800/50 transition-colors duration-300">
        {product.imageUrl ? (
          <>
            {/* Main Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              // Fades out on hover IF there is a secondary image available
              className={`absolute inset-0 p-6 object-contain w-full h-full transform group-hover:scale-110 transition-all duration-500 drop-shadow-2xl ${
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
                className="absolute inset-0 p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 drop-shadow-2xl"
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-zinc-800 text-sm font-black tracking-widest uppercase absolute inset-0">
            No Image
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-grow z-10 bg-surface-bg">
        <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
          <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-3 text-zinc-100">{product.name}</h3>
        </Link>

        <div className="mt-auto pt-4 flex flex-col gap-4">
          <div className="font-black text-lg text-brand transition-colors duration-300">
            LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest transition-colors duration-300"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}