// components/admin/promo-toggle.tsx
"use client";

import { useState, useTransition } from "react";
import { toggleProductPromotion } from "@/lib/actions/admin-products";
import { Loader2, X } from "lucide-react";

export function PromoToggle({
  productId,
  onSale,
  price
}: {
  productId: string;
  onSale: boolean;
  price: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  // Suggest a default 10% discount to save typing time
  const [newSalePrice, setNewSalePrice] = useState((price * 0.9).toString());

  const handleToggleClick = () => {
    if (onSale) {
      // If currently ON, clicking it turns it OFF instantly
      startTransition(async () => {
        await toggleProductPromotion(productId, false, null);
      });
    } else {
      // If currently OFF, open the modal to ask for the price
      setShowModal(true);
    }
  };

  const handleSavePromo = () => {
    const salePriceNum = Number(newSalePrice);

    // Quick validation to prevent mistakes
    if (isNaN(salePriceNum) || salePriceNum <= 0 || salePriceNum >= price) {
      alert("Please enter a valid sale price that is lower than the original price.");
      return;
    }

    setShowModal(false);
    startTransition(async () => {
      await toggleProductPromotion(productId, true, salePriceNum);
    });
  };

  return (
    <>
      {/* The Toggle Button */}
      <button
        onClick={handleToggleClick}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          onSale ? 'bg-red-500' : 'bg-zinc-700'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isPending && <Loader2 className="absolute -left-5 w-4 h-4 animate-spin text-zinc-400" />}
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            onSale ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      {/* The Price Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-1">Set Promo Price</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Original Price: <span className="text-yellow-500 font-bold ml-1">LKR {price.toLocaleString()}</span>
            </p>

            <div className="mb-6">
              <label className="block text-[10px] font-black text-zinc-500 mb-2 uppercase tracking-widest">
                New Sale Price (LKR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">Rs.</span>
                <input
                  type="number"
                  value={newSalePrice}
                  onChange={(e) => setNewSalePrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePromo()}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white font-black text-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePromo}
                className="flex-1 px-4 py-3 rounded-xl font-black tracking-wide text-sm bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
              >
                Start Promo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}