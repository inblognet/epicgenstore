// components/admin/bank-page-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateBankPageData } from "@/app/actions/admin-settings";

// --- DEFAULT DATA (Matches your mockup exactly) ---
export const defaultBankData = {
  hero: {
    badge: "Payment Information",
    title: "Bank Details & Payment Information",
    subtitle: "Complete payment instructions and secure banking options for your computer purchases."
  },
  alerts: {
    title: "Payment එකක් කිරීමට පෙර සැලකිලිමත් විය යුතු කරුණු",
    subtitle: "Important things to consider before making a payment",
  },
  banks: {
    title: "Bank Accounts",
    subtitle: "Choose a secure bank account below to make your payment",
    acc1: { bankName: "Commercial Bank", accName: "MSK Computers", accNum: "1000526890" },
    acc2: { bankName: "Seylan Bank", accName: "M S K Computers", accNum: "008013289765120" }
  },
  help: {
    title: "Need Help with Payments?",
    subtitle: "Contact us for payment assistance or stock confirmation before making your payment",
    phone: "075 550 69 39",
    whatsapp: "+94755506939",
    address: "No.296/3B, Delpe Junction, Ragama",
    bottomBadge: "Your order will be processed within 24 hours of payment confirmation"
  }
};

export function BankPageEditor({ initialData }: { initialData: Partial<typeof defaultBankData> | null }) {
  const router = useRouter();
  const [data, setData] = useState<typeof defaultBankData>(
    initialData && Object.keys(initialData).length > 0 ? (initialData as typeof defaultBankData) : defaultBankData
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBankPageData(data);
      alert("Bank page updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <div className="sticky top-4 z-50 bg-surface-card border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center shadow-2xl transition-colors duration-300">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Bank Page Editor</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Live preview updates automatically on save.</p>
        </div>
        {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover */}
        <button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-hover text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Hero Section</h3>
        <div className="grid grid-cols-1 gap-4">
          {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 focus:border-brand */}
          <input type="text" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Main Title" />
          <textarea value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={2} placeholder="Subtitle" />
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Bank Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 border border-zinc-800/50 rounded-xl bg-surface-bg/30 transition-colors duration-300">
            <h4 className="text-white text-xs font-bold uppercase">Account 1</h4>
            <input type="text" value={data.banks.acc1.bankName} onChange={(e) => setData({ ...data, banks: { ...data.banks, acc1: { ...data.banks.acc1, bankName: e.target.value } } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Bank Name" />
            <input type="text" value={data.banks.acc1.accName} onChange={(e) => setData({ ...data, banks: { ...data.banks, acc1: { ...data.banks.acc1, accName: e.target.value } } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Account Name" />
            <input type="text" value={data.banks.acc1.accNum} onChange={(e) => setData({ ...data, banks: { ...data.banks, acc1: { ...data.banks.acc1, accNum: e.target.value } } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Account Number" />
          </div>
          <div className="space-y-4 p-4 border border-zinc-800/50 rounded-xl bg-surface-bg/30 transition-colors duration-300">
            <h4 className="text-white text-xs font-bold uppercase">Account 2</h4>
            <input type="text" value={data.banks.acc2.bankName} onChange={(e) => setData({ ...data, banks: { ...data.banks, acc2: { ...data.banks.acc2, bankName: e.target.value } } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Bank Name" />
            <input type="text" value={data.banks.acc2.accName} onChange={(e) => setData({ ...data, banks: { ...data.banks, acc2: { ...data.banks.acc2, accName: e.target.value } } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Account Name" />
            <input type="text" value={data.banks.acc2.accNum} onChange={(e) => setData({ ...data, banks: { ...data.banks, acc2: { ...data.banks.acc2, accNum: e.target.value } } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Account Number" />
          </div>
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Help & Contact Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={data.help.phone} onChange={(e) => setData({ ...data, help: { ...data.help, phone: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Phone Number" />
          <input type="text" value={data.help.whatsapp} onChange={(e) => setData({ ...data, help: { ...data.help, whatsapp: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="WhatsApp Number" />
          <input type="text" value={data.help.address} onChange={(e) => setData({ ...data, help: { ...data.help, address: e.target.value } })} className="md:col-span-2 bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Store Address" />
        </div>
      </section>
    </div>
  );
}