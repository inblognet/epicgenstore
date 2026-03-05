// components/admin/contact-page-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateContactPageData } from "@/app/actions/admin-settings";

export const defaultContactData = {
  hero: {
    badge: "Get In Touch",
    title: "Contact MSK COMPUTERS",
    subtitle: "Ready to help you with all your computer needs. From sales to repairs, our expert team is here to provide the best service in Sri Lanka."
  },
  stats: {
    stat1: { icon: "Package", value: "3000+", label: "Products" },
    stat2: { icon: "Users", value: "10,000+", label: "Happy Customers" },
    stat3: { icon: "Headset", value: "Expert", label: "Support Available" },
    stat4: { icon: "ShieldCheck", value: "Best", label: "Warranty" }
  },
  store: {
    address: "No.296/3B, Delpe Junction, Ragama\nSri Lanka",
    phone: "075 550 69 39 / 0777 50 69 39",
    email: "info@mskcomputers.lk",
    hoursWeek: "9:00 AM - 7:00 PM",
    hoursWeekend: "9:30 AM - 6:00 PM",
    hoursClosed: "Closed"
  },
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.5103131742614!2d79.90162591143431!3d7.066669992911299!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2f7413d9646c7%3A0xc0fb1f974ebcd967!2sMSK%20COMPUTERS!5e0!3m2!1sen!2slk!4v1709146142371!5m2!1sen!2slk"
};

export function ContactPageEditor({ initialData }: { initialData: Partial<typeof defaultContactData> | null }) {
  const router = useRouter();
  const [data, setData] = useState<typeof defaultContactData>(
    initialData && Object.keys(initialData).length > 0 ? (initialData as typeof defaultContactData) : defaultContactData
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateContactPageData(data);
      alert("Contact page updated successfully!");
      router.refresh();
    } catch (error) {
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <div className="sticky top-4 z-50 bg-surface-card border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center shadow-2xl transition-colors duration-300">
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Contact Page Editor</h2>
        {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover shadow-brand/20 */}
        <button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-hover text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20">
          <Save className="w-4 h-4 mr-2 inline" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Hero Section</h3>
        <div className="grid gap-4">
          {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 focus:border-brand */}
          <input type="text" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
          <textarea value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={2} />
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Store Info & Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <textarea value={data.store.address} onChange={(e) => setData({ ...data, store: { ...data.store, address: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Address" rows={2} />
            <input type="text" value={data.store.phone} onChange={(e) => setData({ ...data, store: { ...data.store, phone: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Phones" />
            <input type="email" value={data.store.email} onChange={(e) => setData({ ...data, store: { ...data.store, email: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Email" />
          </div>
          <div className="space-y-4 p-4 border border-zinc-800/50 rounded-xl bg-surface-bg/30 transition-colors duration-300">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Mon-Fri Hours</label>
              <input type="text" value={data.store.hoursWeek} onChange={(e) => setData({ ...data, store: { ...data.store, hoursWeek: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white mt-1 focus:border-brand outline-none transition-colors duration-300" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Weekend Hours</label>
              <input type="text" value={data.store.hoursWeekend} onChange={(e) => setData({ ...data, store: { ...data.store, hoursWeekend: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white mt-1 focus:border-brand outline-none transition-colors duration-300" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Poya Days</label>
              <input type="text" value={data.store.hoursClosed} onChange={(e) => setData({ ...data, store: { ...data.store, hoursClosed: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-2 text-xs text-white mt-1 focus:border-brand outline-none transition-colors duration-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Google Map Embed URL</h3>
        <textarea value={data.mapUrl} onChange={(e) => setData({ ...data, mapUrl: e.target.value })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white font-mono focus:border-brand outline-none transition-colors duration-300" rows={4} placeholder="Paste Google Maps iframe src URL here" />
      </section>
    </div>
  );
}