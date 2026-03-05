// components/admin/refund-page-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2 } from "lucide-react";
import { updateRefundPolicyData } from "@/app/actions/admin-settings";

// --- DEFAULT DATA (Based on your provided sample) ---
export const defaultRefundData = {
  header: {
    title: "Refund & Return Policy",
    lastUpdated: "Last updated: February 28, 2026"
  },
  sections: [
    {
      title: "1. Refund Policy",
      content: "Thank you for shopping at MSK COMPUTERS. We value your satisfaction and strive to provide you with the best online shopping experience possible. If, for any reason, you are not completely satisfied with your purchase, we are here to help."
    },
    {
      title: "2. Returns",
      content: "We accept returns within 7 days from the date of purchase. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging."
    },
    {
      title: "3. Refunds",
      content: "Once we receive your return and inspect the item, we will notify you of the status of your refund. If your return is approved, we will initiate a refund to your original method of payment. Please note that the refund amount will exclude any shipping charges incurred during the initial purchase."
    },
    {
      title: "4. Exchanges",
      content: "If you would like to exchange your item for a different size, color, or style, please contact our customer support team within 7 days of receiving your order. We will provide you with further instructions on how to proceed with the exchange."
    },
    {
      title: "5. Non-Returnable Items",
      content: "Certain items are non-returnable and non-refundable. These include:\n- Gift cards\n- Downloadable software products\n- Personalized or custom-made items\n- Perishable goods\n- Items with physical damage or missing warranty stickers"
    },
    {
      title: "6. Damaged or Defective Items",
      content: "In the unfortunate event that your item arrives damaged or defective, please contact us immediately. We will arrange for a replacement or issue a refund, depending on your preference and product availability."
    },
    {
      title: "7. Return Shipping",
      content: "You will be responsible for paying the shipping costs for returning your item unless the return is due to our error (e.g., wrong item shipped, defective product). In such cases, we will provide you with a prepaid shipping label."
    },
    {
      title: "8. Processing Time",
      content: "Refunds and exchanges will be processed within 14 business days after we receive your returned item. Please note that it may take additional time for the refund to appear in your account, depending on your payment provider."
    }
  ],
  contact: {
    title: "Contact Us",
    desc: "If you have any questions or concerns regarding our refund policy, please contact our customer support team. We are here to assist you and ensure your shopping experience with us is enjoyable and hassle-free.",
    companyName: "MSK COMPUTERS - Support Team",
    email: "info@mskcomputers.lk",
    phone: "075 550 69 39",
    address: "No.296/3B, Delpe Junction, Ragama, Sri Lanka"
  }
};

export function RefundPolicyEditor({ initialData }: { initialData: Partial<typeof defaultRefundData> | null }) {
  const router = useRouter();
  const [data, setData] = useState<typeof defaultRefundData>(
    initialData && Object.keys(initialData).length > 0 ? (initialData as typeof defaultRefundData) : defaultRefundData
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRefundPolicyData(data);
      alert("Refund Policy updated successfully!");
      router.refresh();
    } catch (error) {
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
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Refund Policy Editor</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Manage your return terms below.</p>
        </div>
        {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover shadow-brand/20 */}
        <button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-hover text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Header Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={data.header.title} onChange={(e) => setData({ ...data, header: { ...data.header, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
          <input type="text" value={data.header.lastUpdated} onChange={(e) => setData({ ...data, header: { ...data.header, lastUpdated: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4 mb-6 transition-colors duration-300">
          <h3 className="text-brand font-black uppercase tracking-widest transition-colors duration-300">Policy Sections</h3>
          {/* REPLACED: bg-zinc-800 -> bg-surface-bg */}
          <button type="button" onClick={addSection} className="bg-surface-bg hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors duration-300">
            <Plus className="w-3 h-3" /> Add Section
          </button>
        </div>
        <div className="space-y-6">
          {data.sections.map((sec, idx) => (
            // REPLACED: bg-zinc-950 -> bg-surface-bg
            <div key={idx} className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-6 relative transition-colors duration-300">
              <button onClick={() => removeSection(idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors duration-300">
                <Trash2 className="w-4 h-4" />
              </button>
              {/* REPLACED: bg-zinc-900 -> bg-surface-card */}
              <input type="text" value={sec.title} onChange={(e) => updateSection(idx, "title", e.target.value)} className="w-full bg-surface-card border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-white font-bold mb-4 focus:border-brand outline-none transition-colors duration-300" placeholder="Section Title" />
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