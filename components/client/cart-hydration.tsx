// components/client/cart-hydration.tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function CartHydration() {
  useEffect(() => {
    // This safely pulls the cart data from localStorage only AFTER the browser has loaded
    useCartStore.persist.rehydrate();
  }, []);

  return null; // This component doesn't render any UI, it just runs logic
}