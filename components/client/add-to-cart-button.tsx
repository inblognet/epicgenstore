// components/client/add-to-cart-button.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { WishlistButton } from "./wishlist-button";

interface ProductPayload {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
}

export function AddToCartButton({
  product,
  initialIsWishlisted,
  isCard = false // Tells the component if it's on a small grid card
}: {
  product: ProductPayload;
  initialIsWishlisted?: boolean;
  isCard?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);

  // --- FIXED: Grab both addItem AND openCart from the store ---
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevents navigating if inside a link
    addItem({
      ...product,
      quantity: isCard ? 1 : quantity, // Cards always Quick-Add 1 item
    });

    // --- NEW: Automatically open the cart drawer ---
    if (openCart) {
      openCart();
    }
  };

  // --- 1. COMPACT CARD LAYOUT (Hover to reveal, clean UI) ---
  if (isCard) {
    return (
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 mt-4">
        <button
          onClick={handleAddToCart}
          className="w-full h-10 bg-brand hover:bg-brand-hover text-black font-black uppercase text-xs tracking-widest rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Quick Add
        </button>
      </div>
    );
  }

  // --- 2. FULL ENTERPRISE LAYOUT (For the main Product page) ---
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-6">

      {/* Quantity Selector */}
      <div className="flex items-center justify-between bg-surface-bg border border-theme-border rounded-xl h-14 w-full sm:w-32 px-2 transition-colors duration-300">
        <button onClick={handleDecrement} className="p-2 text-theme-muted hover:text-brand transition-colors" type="button">
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-black text-lg text-theme-main min-w-[1.5rem] text-center">{quantity}</span>
        <button onClick={handleIncrement} className="p-2 text-theme-muted hover:text-brand transition-colors" type="button">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="flex-1 h-14 bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-brand/20 active:scale-[0.98] flex items-center justify-center gap-3 w-full"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>

      {/* Wishlist Toggle */}
      <div className="h-14 w-14 shrink-0">
        <WishlistButton
          productId={product.id}
          initialIsWishlisted={initialIsWishlisted}
        />
      </div>

    </div>
  );
}