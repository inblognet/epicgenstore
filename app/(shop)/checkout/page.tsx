// app/(shop)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote, Building, Tag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { validateVoucherCode } from "@/app/actions/vouchers";
import { placeOrder } from "@/app/actions/orders";

type PaymentMethod = "CARD" | "COD" | "BANK";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deliverToBilling, setDeliverToBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher Logic States
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string,
    type: string,
    value: number,
    productIds: string[]
  } | null>(null);

  const { items, getTotal, clearCart } = useCartStore();

  // --- FIXED: HYDRATION GUARD ---
  useEffect(() => {
    // Using a microtask to ensure the state update doesn't conflict with the render cycle
    // and satisfies strict ESLint rules for synchronous updates in effects.
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // --- FIXED: REDIRECT LOGIC ---
  useEffect(() => {
    // Only redirect if hydration is complete, cart is empty, and not submitting
    if (mounted && items.length === 0 && !isSubmitting) {
      router.push("/products");
    }
  }, [mounted, items.length, isSubmitting, router]);

  const subtotal = getTotal();
  let discountAmount = 0;

  if (appliedVoucher) {
    if (appliedVoucher.productIds.length > 0) {
      const eligibleItems = items.filter(item => appliedVoucher.productIds.includes(item.id));
      const eligibleTotal = eligibleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      discountAmount = appliedVoucher.type === "PERCENTAGE" ? eligibleTotal * (appliedVoucher.value / 100) : appliedVoucher.value;
    } else {
      discountAmount = appliedVoucher.type === "PERCENTAGE" ? subtotal * (appliedVoucher.value / 100) : appliedVoucher.value;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  const grandTotal = subtotal - discountAmount;

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setIsApplying(true);
    setVoucherError("");
    const res = await validateVoucherCode(voucherInput);
    if (res.success && res.voucher) {
      setAppliedVoucher(res.voucher);
      setVoucherInput("");
    } else {
      setVoucherError(res.error || "Invalid code");
    }
    setIsApplying(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await placeOrder(items, discountAmount, appliedVoucher?.code || undefined);

      if (res.success && res.orderId) {
        clearCart();
        router.push(`/success?orderId=${res.orderId}&method=${paymentMethod}`);
      } else {
        setIsSubmitting(false);
        alert(res.error || "Failed to place order.");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      setIsSubmitting(false);
      alert("An unexpected error occurred.");
    }
  };

  if (!mounted || (items.length === 0 && !isSubmitting)) return null;

  return (
    <div className="bg-zinc-950 min-h-screen font-sans text-zinc-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-4 uppercase tracking-tight italic">Secure Checkout</h1>
          <Link href="/login" className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-1 rounded-md hover:bg-yellow-500 hover:text-black transition-colors uppercase text-[10px] font-black">
            LOGIN
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
              <h2 className="font-black text-xs text-zinc-500 uppercase tracking-widest mb-6">Client Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="firstName" required placeholder="First Name" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs focus:border-yellow-500 outline-none" />
                <input type="text" name="lastName" required placeholder="Last Name" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs focus:border-yellow-500 outline-none" />
                <input type="tel" name="phone" required placeholder="Phone Number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs focus:border-yellow-500 outline-none" />
                <input type="email" name="email" required placeholder="Email Address" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs focus:border-yellow-500 outline-none" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="font-black text-xs text-zinc-500 uppercase tracking-widest mb-6">Billing Address</h2>
              <div className="space-y-4">
                <input type="text" name="address1" required placeholder="Street Address" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs focus:border-yellow-500 outline-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="city" required placeholder="City" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs focus:border-yellow-500 outline-none" />
                  <input type="text" name="postalCode" placeholder="Postal Code" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs focus:border-yellow-500 outline-none" />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!deliverToBilling} onChange={() => setDeliverToBilling(!deliverToBilling)} className="accent-yellow-500" />
                  <span className="text-xs text-zinc-400 font-bold uppercase">Deliver to different address</span>
                </label>
              </div>
            </div>

            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest">Select Payment Method</div>
              <div className="p-6 space-y-4">
                {(["CARD", "COD", "BANK"] as const).map((method) => (
                  <label key={method} className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === method ? 'border-yellow-500 bg-yellow-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
                    <div className="flex items-start gap-3">
                      <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mt-1 accent-yellow-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white uppercase">{method === 'CARD' ? 'Credit / Debit' : method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
                          {method === 'CARD' ? <CreditCard className="w-4 h-4 text-zinc-500" /> : method === 'COD' ? <Banknote className="w-4 h-4 text-zinc-500" /> : <Building className="w-4 h-4 text-zinc-500" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">{method === 'BANK' ? 'Upload slip after transfer' : 'Standard processing'}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
              <h2 className="font-black text-[10px] text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-10 h-10 bg-black rounded border border-zinc-800 p-1 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl || ""} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <p className="font-bold text-zinc-300 line-clamp-1 text-[10px] uppercase">{item.name}</p>
                      <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-black text-yellow-500 text-[10px]">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 pt-6 border-t border-zinc-800">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Discount Code</label>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-green-400">
                      <Tag className="w-4 h-4" />
                      <span className="font-black text-xs uppercase tracking-widest">{appliedVoucher.code}</span>
                    </div>
                    <button type="button" onClick={handleRemoveVoucher} className="text-green-500 hover:text-green-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={voucherInput} onChange={(e) => setVoucherInput(e.target.value.toUpperCase())} placeholder="ENTER CODE" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs outline-none focus:border-yellow-500 transition-all uppercase font-bold" />
                    <button type="button" onClick={handleApplyVoucher} disabled={isApplying || !voucherInput} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50">
                      {isApplying ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {voucherError && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-tight">{voucherError}</p>}
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex justify-between text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-zinc-100 font-black">LKR {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-500 font-bold uppercase text-[10px] tracking-widest">
                    <span>Discount</span>
                    <span className="font-black">-LKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4 border-t border-zinc-800">
                  <span className="font-black text-xs uppercase tracking-widest text-zinc-500">Total Due</span>
                  <span className="font-black text-2xl text-yellow-500 italic">LKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl mt-8 shadow-lg shadow-yellow-500/10 transition-all active:scale-95 uppercase text-sm tracking-widest disabled:opacity-50">
                {isSubmitting ? "Processing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}