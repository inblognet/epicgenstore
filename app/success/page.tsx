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
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="max-w-md w-full bg-surface-card border border-theme-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300">

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-3xl transition-colors duration-300" />

        <div className="relative z-10 flex flex-col items-center text-center">

          {/* Success Status Circle */}
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border-4 border-surface-bg shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-colors duration-300">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-4xl font-black text-theme-main uppercase tracking-tighter mb-4 italic transition-colors duration-300">
            Order Received!
          </h1>

          <p className="text-theme-muted text-xs font-bold uppercase tracking-widest leading-relaxed mb-10 transition-colors duration-300">
            Thank you for choosing EpicGenStore. Your hardware is being prepared for the next stage.
          </p>

          {/* Detailed Info Card */}
          <div className="w-full bg-surface-bg border border-theme-border rounded-3xl p-6 mb-10 text-left shadow-inner transition-colors duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-theme-border pb-4 transition-colors duration-300">
              <span className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em]">Order ID</span>
              <span className="text-xs font-black text-brand font-mono tracking-tighter transition-colors duration-300">
                #{orderId?.slice(0, 18)}...
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-surface-card rounded-xl flex items-center justify-center border border-theme-border transition-colors duration-300">
                {method === "COD" && <Truck className="w-5 h-5 text-brand transition-colors duration-300" />}
                {method === "BANK" && <Building2 className="w-5 h-5 text-brand transition-colors duration-300" />}
                {method === "CARD" && <CreditCard className="w-5 h-5 text-brand transition-colors duration-300" />}
              </div>

              <div>
                <h3 className="text-[10px] font-black text-theme-main uppercase tracking-widest mb-1 transition-colors duration-300">
                  {method === "COD" ? "Cash on Delivery" : method === "BANK" ? "Bank Transfer" : "Payment Confirmed"}
                </h3>

                <p className="text-[9px] text-theme-muted leading-normal font-bold uppercase tracking-tight transition-colors duration-300">
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
              className="bg-surface-bg hover:opacity-80 text-theme-main font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 text-center border border-theme-border duration-300"
            >
              Track Order
            </Link>
            <Link
              href="/products"
              className="bg-brand hover:bg-brand-hover text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-brand/20 duration-300"
            >
              <ShoppingBag className="w-4 h-4" /> Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}