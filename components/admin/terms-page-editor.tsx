// components/admin/terms-page-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2 } from "lucide-react";
import { updateTermsPageData } from "@/app/actions/admin-settings";

// --- DEFAULT DATA (Based on your provided sample) ---
export const defaultTermsData = {
  header: {
    title: "Terms and Conditions",
    lastUpdated: "Last updated: February 28, 2026",
    intro: "Welcome to MSK COMPUTERS. These Terms and Conditions govern your use of our website and the purchase and sale of products from our platform. By accessing and using our website, you agree to comply with these terms. Please read them carefully before proceeding with any transactions."
  },
  sections: [
    {
      title: "1. Use of the Website",
      content: "- You must be at least 18 years old to use our website or make purchases.\n- You are responsible for maintaining the confidentiality of your account information, including your username and password.\n- You agree to provide accurate and current information during the registration and checkout process.\n- You may not use our website for any unlawful or unauthorized purposes."
    },
    {
      title: "2. Product Information and Pricing",
      content: "- We strive to provide accurate product descriptions, images, and pricing information. However, we do not guarantee the accuracy or completeness of such information.\n- Prices are subject to change without notice. Any promotions or discounts are valid for a limited time and may be subject to additional terms and conditions."
    },
    {
      title: "3. Orders and Payments",
      content: "- By placing an order on our website, you are making an offer to purchase the selected products.\n- We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.\n- You agree to provide valid and up-to-date payment information and authorize us to charge the total order amount to your chosen payment method.\n- We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details."
    },
    {
      title: "4. Shipping and Delivery",
      content: "- We will make reasonable efforts to ensure timely shipping and delivery of your orders.\n- Shipping and delivery times provided are estimates and may vary based on your location and other factors."
    },
    {
      title: "5. Returns and Refunds",
      content: "- Our Returns and Refund Policy governs the process and conditions for returning products and seeking refunds. Please refer to the policy provided on our website for more information."
    },
    {
      title: "6. Intellectual Property",
      content: "- All content and materials on our website, including but not limited to text, images, logos, and graphics, are protected by intellectual property rights and are the property of MSK COMPUTERS or its licensors.\n- You may not use, reproduce, distribute, or modify any content from our website without our prior written consent."
    },
    {
      title: "7. Limitation of Liability",
      content: "- In no event shall MSK COMPUTERS, its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or the purchase and use of our products.\n- We make no warranties or representations, express or implied, regarding the quality, accuracy, or suitability of the products offered on our website."
    },
    {
      title: "8. Amendments and Termination",
      content: "- We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes."
    }
  ],
  contact: {
    title: "Questions About Our Terms?",
    desc: "If you have any questions or concerns regarding our terms and conditions, please contact our support team.",
    companyName: "MSK COMPUTERS - Legal Team",
    email: "info@mskcomputers.lk",
    phone: "075 550 69 39",
    address: "No.296/3B, Delpe Junction, Ragama, Sri Lanka"
  }
};

export function TermsPageEditor({ initialData }: { initialData: Partial<typeof defaultTermsData> | null }) {
  const router = useRouter();
  const [data, setData] = useState<typeof defaultTermsData>(
    initialData && Object.keys(initialData).length > 0 ? (initialData as typeof defaultTermsData) : defaultTermsData
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTermsPageData(data);
      alert("Terms & Conditions updated successfully!");
      router.refresh();
    } catch (error) {
      // FIXED: Used the error variable to clear the linting warning
      console.error("Failed to save Terms page:", error);
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
      <div className="sticky top-4 z-50 bg-surface-card border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center shadow-2xl transition-colors duration-300">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Terms & Conditions Editor</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Manage your website terms below.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-hover text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Header Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={data.header.title} onChange={(e) => setData({ ...data, header: { ...data.header, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
          <input type="text" value={data.header.lastUpdated} onChange={(e) => setData({ ...data, header: { ...data.header, lastUpdated: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
          <textarea value={data.header.intro} onChange={(e) => setData({ ...data, header: { ...data.header, intro: e.target.value } })} className="md:col-span-2 bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={3} placeholder="Introductory paragraph..." />
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4 mb-6 transition-colors duration-300">
          <h3 className="text-brand font-black uppercase tracking-widest transition-colors duration-300">Terms Sections</h3>
          <button type="button" onClick={addSection} className="bg-surface-bg hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors duration-300">
            <Plus className="w-3 h-3" /> Add Section
          </button>
        </div>
        {/* FIXED: Escaped the quote marks around the hyphen */}
        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-6">Tip: Start lines with &quot;-&quot; to automatically create brand-colored bullet points.</p>
        <div className="space-y-6">
          {data.sections.map((sec, idx) => (
            <div key={idx} className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-6 relative transition-colors duration-300">
              <button onClick={() => removeSection(idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors duration-300">
                <Trash2 className="w-4 h-4" />
              </button>
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