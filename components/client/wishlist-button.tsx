// components/client/wishlist-button.tsx
"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { useSession } from "next-auth/react";

interface WishlistButtonProps {
  productId: string;
  initialIsWishlisted?: boolean;
}

export function WishlistButton({ productId, initialIsWishlisted = false }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents navigating if this button is inside a <Link>

    if (!session) {
      alert("Please log in to add items to your wishlist.");
      return;
    }

    // Optimistic UI update (instantly flip the state)
    setIsWishlisted(!isWishlisted);

    // Run the actual database action in the background
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (!result.success && result.message) {
        // If it failed, revert the heart icon back to its original state
        setIsWishlisted(isWishlisted);
        alert(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      // REPLACED: p-2.5 rounded-full -> w-full h-full rounded-xl flex items-center justify-center
      className="w-full h-full rounded-xl bg-surface-bg border border-theme-border flex items-center justify-center text-theme-muted hover:text-brand hover:border-brand transition-all duration-300 group shadow-md"
      aria-label="Toggle Wishlist"
    >
      <Heart
        // REPLACED: w-5 h-5 -> w-6 h-6
        className={`w-6 h-6 transition-all duration-300 ${
          isWishlisted
            ? "fill-red-500 text-red-500 scale-110" // Active state
            : "text-theme-muted group-hover:text-brand" // Inactive state
        }`}
      />
    </button>
  );
}