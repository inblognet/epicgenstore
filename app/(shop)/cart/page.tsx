// app/(shop)/cart/page.tsx
"use client";

import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart, ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Using your existing Zustand store
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Secure Checkout Handler
  const handleCheckout = async () => {
    router.push("/checkout");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-surface-bg flex items-center justify-center text-theme-muted transition-colors duration-300">Loading cart...</div>;
  }

  // --- EMPTY CART STATE ---
  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-surface-bg text-theme-main flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-surface-card border border-theme-border rounded-3xl p-12 text-center max-w-lg w-full flex flex-col items-center shadow-xl transition-colors duration-300">
          <div className="h-24 w-24 bg-surface-bg rounded-full flex items-center justify-center mb-6 text-theme-muted border border-theme-border">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Your Cart is Empty</h1>
          {/* FIXED: Escaped the apostrophe using &apos; */}
          <p className="text-theme-muted mb-8 font-medium">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/products"
            className="bg-brand hover:bg-brand-hover text-black font-bold py-3 px-8 rounded-full transition-transform active:scale-95 w-full sm:w-auto shadow-lg shadow-brand/20"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Calculate dynamic totals based on the Zustand store
  const finalTotal = getTotal();
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = 0; // Update this if your store handles discounts

  // --- ACTIVE CART STATE ---
  return (
    <div className="min-h-screen bg-surface-bg text-theme-main py-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mb-8 border-b border-theme-border pb-6 transition-colors duration-300">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Shopping Cart</h1>
          <p className="text-theme-muted text-sm">Review your items before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-surface-card border border-theme-border rounded-xl overflow-hidden shadow-xl transition-colors duration-300">
              <div className="bg-surface-bg/50 px-6 py-4 border-b border-theme-border transition-colors duration-300">
                <h2 className="font-bold text-lg text-brand transition-colors duration-300">Cart Items ({items.length})</h2>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b border-theme-border last:border-0 last:pb-0 relative group transition-colors duration-300">

                    {/* Item Image */}
                    <div className="w-full sm:w-28 h-28 bg-surface-bg rounded-lg border border-theme-border flex-shrink-0 overflow-hidden p-2 transition-colors duration-300">
                      {item.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-theme-muted font-black uppercase tracking-widest">No Img</div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 w-full">
                      <Link href={`/product/${item.slug}`} className="hover:text-brand transition-colors duration-300">
                        <h3 className="font-bold text-sm leading-snug mb-2 text-theme-main line-clamp-2">{item.name}</h3>
                      </Link>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-black text-brand text-lg transition-colors duration-300">
                          LKR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-theme-muted font-bold uppercase tracking-widest hidden sm:block">Qty:</span>
                        <div className="flex items-center bg-surface-bg border border-theme-border rounded-md overflow-hidden h-9 transition-colors duration-300">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-full flex items-center justify-center text-theme-muted hover:text-brand hover:bg-surface-card transition-colors duration-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-theme-main">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-theme-muted hover:text-brand hover:bg-surface-card transition-colors duration-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="font-black text-lg hidden sm:block text-theme-main">
                          LKR {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors flex items-center gap-1 sm:mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:hidden" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link href="/products" className="inline-flex items-center text-brand hover:opacity-80 font-bold text-sm transition-opacity uppercase tracking-widest duration-300">
                <ChevronLeft className="w-4 h-4 mr-1" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Box */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            <div className="bg-surface-card border border-theme-border rounded-xl p-6 shadow-2xl sticky top-24 transition-colors duration-300">
              <h2 className="font-bold text-lg mb-6 border-b border-theme-border pb-4 text-theme-main transition-colors duration-300">Order Summary</h2>

              <div className="space-y-4 text-sm mb-6 font-medium">
                <div className="flex justify-between text-theme-muted">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <div className="flex flex-col">
                      <span>Discount</span>
                      <span className="text-[10px] opacity-80">You save</span>
                    </div>
                    <span>-LKR {discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between text-theme-muted">
                  <span>Shipping</span>
                  <span className="text-brand text-xs mt-0.5 font-bold uppercase tracking-widest transition-colors duration-300">Calculated at Checkout</span>
                </div>
              </div>

              <div className="border-t border-theme-border pt-4 mb-6 transition-colors duration-300">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-lg text-theme-main">Grand Total</span>
                  <span className="font-black text-2xl text-brand transition-colors duration-300">LKR {finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[10px] text-theme-muted uppercase tracking-widest font-bold">
                  <span>Final amount</span>
                  <span>(Excl. shipping)</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-brand hover:bg-brand-hover text-black font-black text-sm uppercase tracking-widest py-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand/20 duration-300"
                >
                  Proceed to Checkout
                </Button>
                <button
                  onClick={clearCart}
                  className="w-full bg-transparent border-2 border-theme-border hover:border-brand/50 hover:bg-surface-bg hover:text-brand text-theme-muted font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all duration-300"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className="bg-surface-card border border-theme-border rounded-xl overflow-hidden shadow-lg transition-colors duration-300">
              <div className="px-5 py-4 border-b border-theme-border flex items-center gap-2 transition-colors duration-300">
                <Info className="w-4 h-4 text-brand transition-colors duration-300" />
                <h2 className="font-bold text-sm text-theme-main">Shipping Information</h2>
              </div>
              <div className="p-5">
                {/* Note: Kept the alert orange as it implies an important notice */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-orange-400/90 text-xs leading-relaxed flex items-start gap-3">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
                  <div className="flex flex-col gap-2 font-medium">
                    <p className="font-bold text-orange-500 text-sm">Delivery Charges</p>
                    <p>Kindly note that delivery charges are calculated at checkout or paid upon parcel receipt.</p>
                    {/* cspell:disable-next-line */}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}