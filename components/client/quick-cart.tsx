// components/client/quick-cart.tsx
"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";

interface QuickCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCart({ isOpen, onClose }: QuickCartProps) {
  const { items, removeItem, getTotal } = useCartStore();
  const total = getTotal();

  return (
    // FIXED: Changed z-[100] to z-[110] to ensure it stays above everything.
    // Removed `if (!isOpen) return null` so the CSS transition has time to exit smoothly.
    <div className={`fixed inset-0 z-[110] flex justify-end ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>

      {/* Dark Overlay */}
      {/* FIXED: Added a slower, smoother opacity transition */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* The Sliding Cart Sidebar */}
      {/* FIXED: Upgraded animation.
          duration-700: Slows it down to 0.7 seconds.
          ease-[cubic-bezier(0.16,1,0.3,1)]: Gives it that premium "fast start, slow glide to stop" Apple-style feel.
      */}
      <div
        className={`relative w-full max-w-md bg-surface-card border-l border-zinc-800/50 h-full shadow-2xl flex flex-col transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
          <h2 className="text-lg font-bold text-white tracking-tight">Shopping Cart</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-surface-bg rounded-full transition-colors">
            <span className="sr-only">Close cart</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-zinc-400 font-medium mb-4">Your cart is empty.</p>
              <Button asChild variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-surface-bg transition-colors duration-300">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                {/* Product Image */}
                <div className="w-20 h-20 bg-surface-bg rounded-md overflow-hidden flex-shrink-0 border border-zinc-800/50 p-1 transition-colors duration-300">
                  {item.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-600">
                      No Img
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <Link href={`/product/${item.slug}`} className="font-bold text-sm text-white hover:text-brand transition-colors duration-300 line-clamp-2 leading-snug" onClick={onClose}>
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-500 hover:text-red-500 transition-colors p-1 ml-2 -mr-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex justify-between items-end text-sm">
                    <p className="text-zinc-400 font-medium">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-brand font-black transition-colors duration-300">
                      LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Total & Buttons */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-800/50 bg-surface-bg/50 space-y-4 transition-colors duration-300">
            <div className="flex justify-between text-lg font-black text-white">
              <span>Subtotal:</span>
              <span className="text-brand transition-colors duration-300">LKR {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-xs text-zinc-400 text-center">Shipping & taxes calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-surface-card hover:text-white font-bold transition-colors duration-300" onClick={onClose}>
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button asChild className="w-full bg-brand text-black hover:bg-brand-hover font-bold transition-colors duration-300" onClick={onClose}>
                <Link href="/cart">Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}