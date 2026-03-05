// app/success/page.tsx
import Link from "next/link";
import { CheckCircle2, ShoppingBag, Truck, Building2, CreditCard } from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; method?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId;
  const method = params.method;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">

          {/* Success Status Circle */}
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border-4 border-zinc-950 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
            Order Received!
          </h1>

          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
            Thank you for choosing EpicGenStore. Your hardware is being prepared for the next stage.
          </p>

          {/* Detailed Info Card */}
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-10 text-left shadow-inner">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Order ID</span>
              <span className="text-xs font-black text-yellow-500 font-mono tracking-tighter">
                #{orderId?.slice(0, 18)}...
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                {method === "COD" && <Truck className="w-5 h-5 text-yellow-500" />}
                {method === "BANK" && <Building2 className="w-5 h-5 text-yellow-500" />}
                {method === "CARD" && <CreditCard className="w-5 h-5 text-yellow-500" />}
              </div>

              <div>
                <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest mb-1">
                  {method === "COD" ? "Cash on Delivery" : method === "BANK" ? "Bank Transfer" : "Payment Confirmed"}
                </h3>

                <p className="text-[9px] text-zinc-500 leading-normal font-bold uppercase tracking-tight">
                  {method === "COD" && "Prepare exact amount for courier arrival."}
                  {method === "BANK" && "Transfer to BOC: 12345678 and upload slip."}
                  {method === "CARD" && "Deployment scheduled. Check your email."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <Link
              href="/profile"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 text-center border border-zinc-700/50"
            >
              Track Order
            </Link>
            <Link
              href="/products"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/10"
            >
              <ShoppingBag className="w-4 h-4" /> Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}