// components/admin/service-page-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, X } from "lucide-react";
import { updateServicePageData } from "@/app/actions/admin-settings";

// --- DEFAULT DATA STRUCTURE ---
export const defaultServiceData = {
  hero: {
    title: "Professional Computer Repair Services",
    subtitle: "Professional computer repair and maintenance services with expert technicians, genuine parts, and comprehensive warranty coverage.",
    locationTitle: "Location",
    locationDesc: "No.296/3B, Delpe Junction\nRagama, Sri Lanka",
    phoneTitle: "Call Now",
    phoneDesc: "075 550 69 39",
    whatsappTitle: "WhatsApp",
    whatsappDesc: "+94755506939"
  },
  services: {
    title: "Our Services",
    subtitle: "Comprehensive computer services for all your technology needs",
    items: [
      { icon: "Wrench", category: "Hardware", title: "Computer & Laptop Repair", desc: "Complete diagnosis and repair for desktops and laptops", points: ["Hardware diagnostics", "Motherboard repair", "Screen replacement", "Keyboard repair"] },
      { icon: "MonitorSmartphone", category: "Software", title: "Software Installation", desc: "Operating system installation and software configuration", points: ["Windows installation", "Software setup", "Driver installation"] }
    ]
  },
  reasons: {
    title: "Why Choose Our Service Center?",
    subtitle: "Professional service with comprehensive warranty and expert support",
    items: [
      { icon: "ShieldCheck", title: "Service Warranty", desc: "All repairs come with comprehensive warranty coverage", points: ["90-day service warranty on all repairs", "Genuine parts guarantee"] },
      { icon: "Clock", title: "Quick Turnaround", desc: "Fast and efficient service delivery", points: ["Same-day diagnosis", "24-48 hour basic repairs"] }
    ]
  },
  process: {
    title: "Our Service Process",
    subtitle: "Simple and transparent process for all repairs",
    items: [
      { num: "01", title: "Diagnosis", desc: "Free comprehensive diagnosis" },
      { num: "02", title: "Estimate", desc: "Transparent pricing estimate" }
    ]
  },
  cta: {
    title: "Ready to Get Your Device Fixed?",
    subtitle: "Contact our expert technicians today for professional computer repair services",
    companyName: "MSK Computers"
  }
};

export function ServicePageEditor({ initialData }: { initialData: Partial<typeof defaultServiceData> | null }) {
  const router = useRouter();
  const [data, setData] = useState<typeof defaultServiceData>(
    initialData && Object.keys(initialData).length > 0
      ? (initialData as typeof defaultServiceData)
      : defaultServiceData
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateServicePageData(data);
      alert("Service page updated successfully!");
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
      {/* Save Header */}
      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <div className="sticky top-4 z-50 bg-surface-card border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center shadow-2xl transition-colors duration-300">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Page Editor</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Live preview updates automatically on save.</p>
        </div>
        {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover shadow-brand/20 */}
        <button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-hover text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      {/* 1. Hero Section Editor */}
      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        {/* REPLACED: text-yellow-500 border-zinc-800 -> text-brand border-zinc-800/50 */}
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">1. Hero Section</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase">Main Title (Use &apos;Repair&apos; to highlight using brand color)</label>
            {/* REPLACED: bg-zinc-950 focus:border-yellow-500 -> bg-surface-bg focus:border-brand */}
            <input type="text" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs mt-2 text-white focus:border-brand outline-none transition-colors duration-300" />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase">Subtitle Description</label>
            {/* REPLACED: bg-zinc-950 focus:border-yellow-500 -> bg-surface-bg focus:border-brand */}
            <textarea value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs mt-2 text-white focus:border-brand outline-none transition-colors duration-300" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase">Location Address</label>
              {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 */}
              <textarea value={data.hero.locationDesc} onChange={(e) => setData({ ...data, hero: { ...data.hero, locationDesc: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-2 text-xs text-white transition-colors duration-300" rows={2} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase">Call Phone Number</label>
              <input type="text" value={data.hero.phoneDesc} onChange={(e) => setData({ ...data, hero: { ...data.hero, phoneDesc: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-2 text-xs text-white transition-colors duration-300" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase">WhatsApp Number</label>
              <input type="text" value={data.hero.whatsappDesc} onChange={(e) => setData({ ...data, hero: { ...data.hero, whatsappDesc: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-2 text-xs text-white transition-colors duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Services Grid Editor */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4 mb-6 transition-colors duration-300">
          <h3 className="text-brand font-black uppercase tracking-widest transition-colors duration-300">2. Services Grid</h3>
          <button onClick={() => setData({ ...data, services: { ...data.services, items: [...data.services.items, { icon: "Wrench", category: "New", title: "New Service", desc: "Description", points: ["Point 1"] }] } })} className="bg-surface-bg hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors duration-300">
            <Plus className="w-3 h-3" /> Add Service
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input type="text" value={data.services.title} onChange={(e) => setData({ ...data, services: { ...data.services, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Section Title" />
          <input type="text" value={data.services.subtitle} onChange={(e) => setData({ ...data, services: { ...data.services, subtitle: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Section Subtitle" />
        </div>

        <div className="space-y-6">
          {data.services.items.map((srv, index) => (
            <div key={index} className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-6 relative transition-colors duration-300">
              <button onClick={() => { const newItems = [...data.services.items]; newItems.splice(index, 1); setData({ ...data, services: { ...data.services, items: newItems } }); }} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors duration-300">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-4 mb-4 pr-8">
                <input type="text" value={srv.category} onChange={(e) => { const newItems = [...data.services.items]; newItems[index].category = e.target.value; setData({ ...data, services: { ...data.services, items: newItems } }) }} className="bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Category (e.g. Hardware)" />
                <input type="text" value={srv.title} onChange={(e) => { const newItems = [...data.services.items]; newItems[index].title = e.target.value; setData({ ...data, services: { ...data.services, items: newItems } }) }} className="bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Title" />
              </div>
              <textarea value={srv.desc} onChange={(e) => { const newItems = [...data.services.items]; newItems[index].desc = e.target.value; setData({ ...data, services: { ...data.services, items: newItems } }) }} className="w-full bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white mb-4 transition-colors duration-300" placeholder="Description" rows={2} />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Bullet Points</label>
                {srv.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex gap-2">
                    <input type="text" value={pt} onChange={(e) => { const newItems = [...data.services.items]; newItems[index].points[pIdx] = e.target.value; setData({ ...data, services: { ...data.services, items: newItems } }) }} className="flex-1 bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-[10px] text-white transition-colors duration-300" />
                    <button onClick={() => { const newItems = [...data.services.items]; newItems[index].points.splice(pIdx, 1); setData({ ...data, services: { ...data.services, items: newItems } }) }} className="text-zinc-600 hover:text-red-500 px-2 transition-colors duration-300"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {/* REPLACED: text-yellow-500 -> text-brand */}
                <button onClick={() => { const newItems = [...data.services.items]; newItems[index].points.push("New point"); setData({ ...data, services: { ...data.services, items: newItems } }) }} className="text-[10px] text-brand uppercase font-bold transition-colors duration-300">+ Add Point</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Reasons Section Editor */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4 mb-6 transition-colors duration-300">
          <h3 className="text-brand font-black uppercase tracking-widest transition-colors duration-300">3. Why Choose Us (Reasons)</h3>
          <button onClick={() => setData({ ...data, reasons: { ...data.reasons, items: [...data.reasons.items, { icon: "Check", title: "New Reason", desc: "Description", points: ["Point 1"] }] } })} className="bg-surface-bg hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors duration-300">
            <Plus className="w-3 h-3" /> Add Reason
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input type="text" value={data.reasons.title} onChange={(e) => setData({ ...data, reasons: { ...data.reasons, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Section Title" />
          <input type="text" value={data.reasons.subtitle} onChange={(e) => setData({ ...data, reasons: { ...data.reasons, subtitle: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Section Subtitle" />
        </div>

        <div className="space-y-6">
          {data.reasons.items.map((reason, index) => (
            <div key={index} className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-6 relative transition-colors duration-300">
              <button onClick={() => { const newItems = [...data.reasons.items]; newItems.splice(index, 1); setData({ ...data, reasons: { ...data.reasons, items: newItems } }); }} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors duration-300">
                <Trash2 className="w-4 h-4" />
              </button>
              <input type="text" value={reason.title} onChange={(e) => { const newItems = [...data.reasons.items]; newItems[index].title = e.target.value; setData({ ...data, reasons: { ...data.reasons, items: newItems } }) }} className="w-full md:w-1/2 bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white mb-4 pr-8 transition-colors duration-300" placeholder="Reason Title" />
              <textarea value={reason.desc} onChange={(e) => { const newItems = [...data.reasons.items]; newItems[index].desc = e.target.value; setData({ ...data, reasons: { ...data.reasons, items: newItems } }) }} className="w-full bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white mb-4 transition-colors duration-300" placeholder="Description" rows={2} />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Bullet Points</label>
                {reason.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex gap-2">
                    <input type="text" value={pt} onChange={(e) => { const newItems = [...data.reasons.items]; newItems[index].points[pIdx] = e.target.value; setData({ ...data, reasons: { ...data.reasons, items: newItems } }) }} className="flex-1 bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-[10px] text-white transition-colors duration-300" />
                    <button onClick={() => { const newItems = [...data.reasons.items]; newItems[index].points.splice(pIdx, 1); setData({ ...data, reasons: { ...data.reasons, items: newItems } }) }} className="text-zinc-600 hover:text-red-500 px-2 transition-colors duration-300"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => { const newItems = [...data.reasons.items]; newItems[index].points.push("New point"); setData({ ...data, reasons: { ...data.reasons, items: newItems } }) }} className="text-[10px] text-brand uppercase font-bold transition-colors duration-300">+ Add Point</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Process Section Editor */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4 mb-6 transition-colors duration-300">
          <h3 className="text-brand font-black uppercase tracking-widest transition-colors duration-300">4. Service Process</h3>
          <button onClick={() => setData({ ...data, process: { ...data.process, items: [...data.process.items, { num: "00", title: "New Step", desc: "Description" }] } })} className="bg-surface-bg hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors duration-300">
            <Plus className="w-3 h-3" /> Add Step
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input type="text" value={data.process.title} onChange={(e) => setData({ ...data, process: { ...data.process, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Section Title" />
          <input type="text" value={data.process.subtitle} onChange={(e) => setData({ ...data, process: { ...data.process, subtitle: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Section Subtitle" />
        </div>

        <div className="space-y-4">
          {data.process.items.map((step, index) => (
            <div key={index} className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-4 flex gap-4 items-center relative transition-colors duration-300">
              <input type="text" value={step.num} onChange={(e) => { const newItems = [...data.process.items]; newItems[index].num = e.target.value; setData({ ...data, process: { ...data.process, items: newItems } }) }} className="w-16 bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-center text-white font-bold transition-colors duration-300" placeholder="Num" />
              <input type="text" value={step.title} onChange={(e) => { const newItems = [...data.process.items]; newItems[index].title = e.target.value; setData({ ...data, process: { ...data.process, items: newItems } }) }} className="w-1/3 bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white transition-colors duration-300" placeholder="Step Title" />
              <input type="text" value={step.desc} onChange={(e) => { const newItems = [...data.process.items]; newItems[index].desc = e.target.value; setData({ ...data, process: { ...data.process, items: newItems } }) }} className="flex-1 bg-surface-card border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-white pr-8 transition-colors duration-300" placeholder="Description" />
              <button onClick={() => { const newItems = [...data.process.items]; newItems.splice(index, 1); setData({ ...data, process: { ...data.process, items: newItems } }); }} className="absolute right-4 text-zinc-600 hover:text-red-500 transition-colors duration-300">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA Section Editor */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">5. Call To Action</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={data.cta.title} onChange={(e) => setData({ ...data, cta: { ...data.cta, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white transition-colors duration-300" placeholder="CTA Title" />
          <input type="text" value={data.cta.companyName} onChange={(e) => setData({ ...data, cta: { ...data.cta, companyName: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white transition-colors duration-300" placeholder="Company Name" />
          <textarea value={data.cta.subtitle} onChange={(e) => setData({ ...data, cta: { ...data.cta, subtitle: e.target.value } })} className="md:col-span-2 bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white transition-colors duration-300" rows={2} placeholder="CTA Subtitle" />
        </div>
      </section>

    </div>
  );
}