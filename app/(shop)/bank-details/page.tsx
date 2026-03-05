// app/(shop)/bank-details/page.tsx
import { prisma } from "@/lib/prisma";
import { defaultBankData } from "@/components/admin/bank-page-editor";
import { AlertTriangle, Ban, CreditCard, Info, MapPin, Building2, Phone, MessageCircle, Store, ShieldCheck } from "lucide-react";

export default async function BankDetailsPage() {
  const settings = await prisma.siteSetting.findFirst();

  const rawData = settings?.bankPageData as unknown as Partial<typeof defaultBankData> | null;
  const data = (rawData && rawData.hero) ? (rawData as typeof defaultBankData) : defaultBankData;

  const renderTitle = (title: string) => {
    if (!title) return "Bank Details & Payment Information";
    const parts = title.split("Payment Information");
    if (parts.length === 1) return title;
    // REPLACED: text-yellow-500 -> text-brand
    return <>{parts[0]} <span className="text-brand transition-colors duration-300">Payment Information</span> {parts[1]}</>;
  };

  return (
    // REPLACED: bg-black -> bg-surface-bg
    <div className="bg-surface-bg min-h-screen text-zinc-50 font-sans pb-24 transition-colors duration-300">

      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 pt-20 pb-16 max-w-4xl text-center">
        {/* REPLACED: border-yellow-500/30 text-yellow-500 -> border-brand/30 text-brand */}
        <div className="inline-flex items-center gap-2 bg-transparent border border-brand/30 text-brand px-4 py-1.5 rounded-full text-xs font-medium mb-8 transition-colors duration-300">
          <Building2 className="w-3.5 h-3.5" /> {data.hero.badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          {renderTitle(data.hero.title)}
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {data.hero.subtitle}
        </p>
      </section>

      {/* 2. ALERTS SECTION */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">{data.alerts.title}</h2>
          <p className="text-zinc-500 text-sm">{data.alerts.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Red Alert */}
          {/* REPLACED: bg-[#121212] -> bg-surface-card */}
          <div className="bg-surface-card border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/40 transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-red-500 font-bold mb-2 text-sm">Stock Confirmation Required</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">Please make sure to confirm the availability of stock by dropping a WhatsApp message or a call prior to making the payment.</p>
              </div>
            </div>
          </div>
          {/* Orange Alert */}
          {/* REPLACED: bg-[#121212] -> bg-surface-card */}
          <div className="bg-surface-card border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/40 transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Ban className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-orange-500 font-bold mb-2 text-sm">No Cash on Delivery</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">Computer deliveries require full payment before dispatch. No cash on delivery.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           {/* Blue Alert */}
           {/* REPLACED: bg-[#121212] -> bg-surface-card */}
           <div className="bg-surface-card border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-blue-500 font-bold mb-2 text-sm">Full Payment Required</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">We will dispatch the order only after receiving full payment for the items.</p>
              </div>
            </div>
          </div>
           {/* Green Alert */}
           {/* REPLACED: bg-[#121212] -> bg-surface-card */}
           <div className="bg-surface-card border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-green-500 font-bold mb-2 text-sm">Price Alert Policy</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">Prices are subject to change without prior notice based on market conditions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BANK ACCOUNTS */}
      {/* REPLACED: bg-[#0a0a0a] -> bg-surface-card/30 */}
      <section className="bg-surface-card/30 py-20 border-y border-zinc-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">{data.banks.title}</h2>
            <p className="text-zinc-400 text-sm">{data.banks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Account 1 */}
            {/* REPLACED: bg-[#121212] border-yellow-500/30 -> bg-surface-card border-brand/30 */}
            <div className="bg-surface-card border border-brand/30 rounded-3xl p-8 relative shadow-[0_0_30px_rgba(var(--color-brand),0.05)] transition-colors duration-300">
              {/* REPLACED: bg-yellow-500 -> bg-brand */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full transition-colors duration-300">
                Primary Account
              </div>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-12 bg-blue-600 rounded flex items-center justify-center text-white font-black text-xs">COM</div>
              </div>
              <h3 className="text-center text-lg font-bold text-white mb-8">{data.banks.acc1.bankName}</h3>
              {/* REPLACED: bg-zinc-950 -> bg-surface-bg */}
              <div className="space-y-4 bg-surface-bg p-4 rounded-xl border border-zinc-800/50 transition-colors duration-300">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Account Name</p>
                  <p className="text-sm text-zinc-200 font-bold">{data.banks.acc1.accName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Account Number</p>
                  {/* REPLACED: text-yellow-500 -> text-brand */}
                  <p className="text-xl text-brand font-mono font-bold tracking-widest transition-colors duration-300">{data.banks.acc1.accNum}</p>
                </div>
              </div>
            </div>

            {/* Account 2 */}
            {/* REPLACED: bg-[#121212] -> bg-surface-card */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 relative transition-colors duration-300">
              <div className="flex justify-center mb-6 mt-3">
                <div className="w-16 h-12 bg-red-600 rounded flex items-center justify-center text-white font-black text-xs">SEY</div>
              </div>
              <h3 className="text-center text-lg font-bold text-white mb-8">{data.banks.acc2.bankName}</h3>
              {/* REPLACED: bg-zinc-950 -> bg-surface-bg */}
              <div className="space-y-4 bg-surface-bg p-4 rounded-xl border border-zinc-800/50 transition-colors duration-300">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Account Name</p>
                  <p className="text-sm text-zinc-200 font-bold">{data.banks.acc2.accName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Account Number</p>
                  {/* REPLACED: text-yellow-500 -> text-brand */}
                  <p className="text-xl text-brand font-mono font-bold tracking-widest transition-colors duration-300">{data.banks.acc2.accNum}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROCESS STEPS */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Payment Instructions</h2>
            <p className="text-zinc-400 text-sm">Follow these steps for secure bank transfers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-12 right-12 h-px bg-zinc-800/50 transition-colors duration-300" />

            {[
              { num: "01", title: "Choose Bank Account", desc: "Select one of the official accounts above." },
              { num: "02", title: "Make Transfer", desc: "Transfer the exact total amount of your order." },
              { num: "03", title: "Send Proof", desc: "Send the deposit slip/screenshot to WhatsApp." },
              { num: "04", title: "Provide Details", desc: "Include your Order ID and delivery details." }
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* REPLACED: bg-yellow-500 -> bg-brand */}
                <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-black font-black text-xl z-10 mb-6 transition-colors duration-300 shadow-lg shadow-brand/20">
                  {step.num}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEED HELP / CONTACT */}
      {/* REPLACED: bg-[#0a0a0a] -> bg-surface-card/30 */}
      <section className="bg-surface-card/30 py-20 border-t border-zinc-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">{data.help.title}</h2>
          <p className="text-zinc-400 text-sm mb-12">{data.help.subtitle}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* REPLACED: bg-[#121212] hover:border-yellow-500/50 -> bg-surface-card hover:border-brand/50 */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 flex flex-col items-center hover:border-brand/50 transition-colors duration-300">
              {/* REPLACED: text-yellow-500 -> text-brand */}
              <Phone className="w-6 h-6 text-brand mb-3 transition-colors duration-300" />
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Call Us</p>
              {/* REPLACED: text-yellow-500 -> text-brand */}
              <p className="text-brand font-bold transition-colors duration-300">{data.help.phone}</p>
            </div>

            {/* REPLACED: bg-[#121212] -> bg-surface-card */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 flex flex-col items-center hover:border-green-500/50 transition-colors duration-300">
              <MessageCircle className="w-6 h-6 text-green-500 mb-3" />
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">WhatsApp</p>
              <p className="text-green-500 font-bold">{data.help.whatsapp}</p>
            </div>

            {/* REPLACED: bg-[#121212] -> bg-surface-card */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 flex flex-col items-center hover:border-zinc-600 transition-colors duration-300">
              <Store className="w-6 h-6 text-zinc-300 mb-3" />
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Visit Store</p>
              <p className="text-zinc-300 text-xs font-bold whitespace-pre-wrap">{data.help.address}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-6 py-4 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm font-bold text-green-400">{data.help.bottomBadge}</span>
          </div>
        </div>
      </section>
    </div>
  );
}