// components/admin/privacy-page-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2 } from "lucide-react";
import { updatePrivacyPolicyData } from "@/app/actions/admin-settings";

// --- DEFAULT DATA (Matches your mockup structure) ---
export const defaultPrivacyData = {
  header: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: February 27, 2026"
  },
  sections: [
    {
      title: "1. Introduction",
      content: "At MSK COMPUTERS, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and protect your data when you visit our website or use our services."
    },
    {
      title: "2. Information We Collect",
      content: "We collect information to provide better services to our customers. This includes:\n\n2.1 Personal Information:\n- Name and contact details (email, phone number, address)\n- Billing and delivery information\n- Account credentials\n\n2.2 Technical Information:\n- Device and browser information\n- IP address and location data\n- Website usage statistics"
    },
    {
      title: "3. How We Use Your Information",
      content: "We use your data for the following purposes:\n- Processing and fulfilling your orders\n- Communicating with you regarding your purchases\n- Providing customer support and warranty services\n- Improving our website and user experience\n- Sending important service updates (e.g., SMS & Email Notifications)"
    },
    {
      title: "4. Data Security",
      content: "We implement robust security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is entirely secure, and we cannot guarantee absolute security."
    }
  ],
  contact: {
    title: "Contact Us About Privacy",
    desc: "If you have any questions or concerns about this Privacy Policy, please contact us:",
    companyName: "MSK COMPUTERS - Privacy Officer",
    email: "info@mskcomputers.lk",
    phone: "075 550 69 39",
    address: "No.296/3B, Delpe Junction, Ragama, Sri Lanka"
  }
};

export function PrivacyPolicyEditor({ initialData }: { initialData: Partial<typeof defaultPrivacyData> | null }) {
  const router = useRouter();
  const [data, setData] = useState<typeof defaultPrivacyData>(
    initialData && Object.keys(initialData).length > 0 ? (initialData as typeof defaultPrivacyData) : defaultPrivacyData
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePrivacyPolicyData(data);
      alert("Privacy Policy updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = () => {
    setData({ ...data, sections: [...data.sections, { title: "New Section", content: "" }] });
  };

  const updateSection = (index: number, field: "title" | "content", value: string) => {
    const newSections = [...data.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setData({ ...data, sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = [...data.sections];
    newSections.splice(index, 1);
    setData({ ...data, sections: newSections });
  };

  return (
    <div className="space-y-12">
      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <div className="sticky top-4 z-50 bg-surface-card border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center shadow-2xl transition-colors duration-300">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Privacy Policy Editor</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Manage your legal text below.</p>
        </div>
        {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover shadow-brand/20 */}
        <button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-hover text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Header Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 focus:border-brand */}
          <input type="text" value={data.header.title} onChange={(e) => setData({ ...data, header: { ...data.header, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
          <input type="text" value={data.header.lastUpdated} onChange={(e) => setData({ ...data, header: { ...data.header, lastUpdated: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4 mb-6 transition-colors duration-300">
          <h3 className="text-brand font-black uppercase tracking-widest transition-colors duration-300">Policy Sections</h3>
          {/* REPLACED: bg-zinc-800 hover:bg-zinc-700 -> bg-surface-bg hover:bg-zinc-800 */}
          <button type="button" onClick={addSection} className="bg-surface-bg hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors duration-300">
            <Plus className="w-3 h-3" /> Add Section
          </button>
        </div>
        <div className="space-y-6">
          {data.sections.map((sec, idx) => (
            <div key={idx} className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-6 relative transition-colors duration-300">
              <button onClick={() => removeSection(idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors duration-300">
                <Trash2 className="w-4 h-4" />
              </button>
              {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 focus:border-brand */}
              <input type="text" value={sec.title} onChange={(e) => updateSection(idx, "title", e.target.value)} className="w-full bg-surface-card border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-white font-bold mb-4 focus:border-brand outline-none transition-colors duration-300" placeholder="Section Title (e.g. 1. Introduction)" />
              <textarea value={sec.content} onChange={(e) => updateSection(idx, "content", e.target.value)} className="w-full bg-surface-card border border-zinc-800/50 rounded-lg px-4 py-3 text-xs text-zinc-300 min-h-[150px] font-mono leading-relaxed focus:border-brand outline-none transition-colors duration-300" placeholder="Enter section content here..." />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Contact Box (Bottom)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={data.contact.title} onChange={(e) => setData({ ...data, contact: { ...data.contact, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Contact Box Title" />
          <input type="text" value={data.contact.companyName} onChange={(e) => setData({ ...data, contact: { ...data.contact, companyName: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Company Name" />
          <textarea value={data.contact.desc} onChange={(e) => setData({ ...data, contact: { ...data.contact, desc: e.target.value } })} className="md:col-span-2 bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={2} placeholder="Description" />
          <input type="text" value={data.contact.email} onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Email" />
          <input type="text" value={data.contact.phone} onChange={(e) => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Phone" />
          <input type="text" value={data.contact.address} onChange={(e) => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} className="md:col-span-2 bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Address" />
        </div>
      </section>
    </div>
  );
}