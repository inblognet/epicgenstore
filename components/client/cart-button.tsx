// components/client/cart-button.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";
import { QuickCart } from "./quick-cart";

export function CartButton() {
  const [mounted, setMounted] = useState(false);

  // Pull everything we need from the global Zustand store!
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);

  // Prevent hydration mismatch for the badge by waiting for the client to mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <button
        onClick={openCart}
        className="relative group p-2 rounded-full hover:bg-surface-card transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-6 w-6 text-theme-muted group-hover:text-brand transition-colors" />
        <span className="sr-only">Shopping Cart</span>

        {mounted && itemCount > 0 && (
          <span className="absolute top-0 right-0 bg-brand text-black text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-surface-bg translate-x-1/4 -translate-y-1/4 shadow-md shadow-brand/20">
            {itemCount}
          </span>
        )}
      </button>

      <QuickCart
        isOpen={isOpen}
        onClose={closeCart}
      />
    </>
  );
}