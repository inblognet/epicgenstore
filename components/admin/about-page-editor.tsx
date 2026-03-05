// components/admin/about-page-editor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2 } from "lucide-react";
import { updateAboutPageData } from "@/app/actions/admin-settings";

// --- DEFAULT DATA ---
export const defaultAboutData = {
  hero: {
    badge: "Company Information",
    title: "About MSK COMPUTERS",
    subtitle: "MSK COMPUTERS has served the Sri Lankan computer market since 2012. We are committed to providing quality computer hardware and excellent service to all our customers."
  },
  visionMission: {
    visionTitle: "අපේ දැක්ම / Our Vision",
    visionDesc: "To be the most trusted computer store in Sri Lanka.",
    missionTitle: "අපේ මෙහෙවර / Our Mission",
    missionDesc: "Providing the highest quality computer hardware & accessories with the best warranty coverage to empower our customers."
  },
  story: "Founded in 2012, MSK COMPUTERS started as a small tech shop and has grown into a premier destination for enterprise hardware. Our dedication to authentic components, transparent pricing, and exceptional customer support has made us a trusted partner for both individuals and businesses across Sri Lanka.",
  commitment: "We are committed to excellence. Every product we sell is backed by our dedicated support team, ensuring that your technological investments are always protected and performing at their best.",
  // NEW: Array for achievement image URLs
  achievements: [
    "",
    "",
    "",
    ""
  ] as string[]
};

export function AboutPageEditor({ initialData }: { initialData: Partial<typeof defaultAboutData> | null }) {
  const router = useRouter();
  const [data, setData] = useState<typeof defaultAboutData>(
    initialData && Object.keys(initialData).length > 0
      ? { ...defaultAboutData, ...initialData }
      : defaultAboutData
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAboutPageData(data);
      alert("About page updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const addAchievement = () => {
    setData({ ...data, achievements: [...(data.achievements || []), ""] });
  };

  const removeAchievement = (index: number) => {
    const newAchievements = [...(data.achievements || [])];
    newAchievements.splice(index, 1);
    setData({ ...data, achievements: newAchievements });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...(data.achievements || [])];
    newAchievements[index] = value;
    setData({ ...data, achievements: newAchievements });
  };

  return (
    <div className="space-y-12">
      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <div className="sticky top-4 z-50 bg-surface-card border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center shadow-2xl transition-colors duration-300">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">About Page Editor</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Live preview updates automatically on save.</p>
        </div>
        {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover shadow-brand/20 */}
        <button onClick={handleSave} disabled={isSaving} className="bg-brand hover:bg-brand-hover text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Hero & Story</h3>
        <div className="grid grid-cols-1 gap-4">
          {/* REPLACED: bg-zinc-950 focus:border-yellow-500 -> bg-surface-bg focus:border-brand */}
          <input type="text" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" placeholder="Main Title" />
          <textarea value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={3} placeholder="Hero Subtitle" />
          <label className="text-[10px] font-black text-zinc-500 uppercase mt-4">Our Story</label>
          <textarea value={data.story} onChange={(e) => setData({ ...data, story: e.target.value })} className="bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={5} />
        </div>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Vision & Mission</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input type="text" value={data.visionMission.visionTitle} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, visionTitle: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
            <textarea value={data.visionMission.visionDesc} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, visionDesc: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={3} />
          </div>
          <div className="space-y-4">
            <input type="text" value={data.visionMission.missionTitle} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, missionTitle: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" />
            <textarea value={data.visionMission.missionDesc} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, missionDesc: e.target.value } })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={3} />
          </div>
        </div>
      </section>

      {/* Achievements Gallery Editor */}
      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4 mb-6 transition-colors duration-300">
          <h3 className="text-brand font-black uppercase tracking-widest transition-colors duration-300">Achievements Gallery</h3>
          {/* REPLACED: bg-zinc-800 -> bg-surface-bg */}
          <button type="button" onClick={addAchievement} className="bg-surface-bg hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors duration-300">
            <Plus className="w-3 h-3" /> Add Image
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.achievements || []).map((url, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-surface-bg p-2 rounded-xl border border-zinc-800/50 transition-colors duration-300">
              <input
                type="text"
                value={url}
                onChange={(e) => updateAchievement(idx, e.target.value)}
                className="flex-1 bg-transparent border-none px-2 text-xs text-white outline-none"
                placeholder="Paste Image URL here..."
              />
              <button type="button" onClick={() => removeAchievement(idx)} className="text-zinc-600 hover:text-red-500 p-2 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-500 mt-4 uppercase font-bold">Paste URLs from a host like Imgur, AWS, or your local /public folder (e.g., /achievements/award1.jpg)</p>
      </section>

      <section className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="text-brand font-black uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-4 transition-colors duration-300">Commitment Footer</h3>
        <textarea value={data.commitment} onChange={(e) => setData({ ...data, commitment: e.target.value })} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand outline-none transition-colors duration-300" rows={4} />
      </section>
    </div>
  );
}