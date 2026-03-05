// app/(admin)/admin/settings/appearance/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Save, Palette } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AdminNav } from "@/components/admin/admin-nav";

// Define our 10 Theme Presets
const THEME_PRESETS = [
  // FIXED: Changed 'bg' and 'card' to pure black (#000000) for Epic Dark
  { id: "theme-epic-dark", name: "Epic Dark (Default)", primary: "#eab308", bg: "#000000", card: "#000000", text: "#fafa" },
  { id: "theme-clean-light", name: "Clean Light", primary: "#3b82f6", bg: "#ffffff", card: "#f4f4f5", text: "#18181b" },
  { id: "theme-midnight", name: "Midnight Blue", primary: "#06b6d4", bg: "#020617", card: "#0f172a", text: "#f8fafc" },
  { id: "theme-emerald", name: "Emerald Forest", primary: "#10b981", bg: "#022c22", card: "#064e3b", text: "#ecfdf5" },
  { id: "theme-crimson", name: "Crimson Blood", primary: "#ef4444", bg: "#450a0a", card: "#7f1d1d", text: "#fef2f2" },
  { id: "theme-cyberpunk", name: "Cyberpunk", primary: "#fde047", bg: "#000000", card: "#1e1b4b", text: "#fef08a" },
  { id: "theme-ocean", name: "Deep Ocean", primary: "#14b8a6", bg: "#083344", card: "#164e63", text: "#cffafe" },
  { id: "theme-sunset", name: "Sunset Orange", primary: "#f97316", bg: "#2a1215", card: "#431407", text: "#ffedd5" },
  { id: "theme-amethyst", name: "Amethyst", primary: "#a855f7", bg: "#2e1065", card: "#3b0764", text: "#f3e8ff" },
  { id: "theme-minimal", name: "Minimalist B&W", primary: "#18181b", bg: "#ffffff", card: "#ffffff", text: "#000000" },
];

export default async function AdminAppearancePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const currentTheme = settings?.themePreset || "theme-epic-dark";

  async function updateTheme(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const newTheme = formData.get("themePreset") as string;

    await prisma.siteSetting.update({
      where: { id: 1 },
      data: { themePreset: newTheme },
    });

    // Revalidate everything so the whole app updates instantly
    revalidatePath("/", "layout");
  }

  return (
    // FIXED: Replaced text-zinc-50 with text-theme-main
    <div className="container mx-auto px-4 py-8 max-w-5xl text-theme-main font-sans pb-24 transition-colors duration-300">
      <AdminNav />

      <div className="flex items-center gap-3 mb-8">
        <Palette className="h-8 w-8 text-brand transition-colors duration-300" />
        {/* FIXED: Replaced text-white with text-theme-main */}
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-main transition-colors duration-300">Appearance & Themes</h1>
      </div>

      <form action={updateTheme} className="bg-surface-card border border-theme-border rounded-3xl p-6 md:p-10 shadow-2xl transition-colors duration-300">
        <div className="mb-8 border-b border-theme-border pb-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-theme-main mb-2 transition-colors duration-300">Global Store Preset</h2>
          <p className="text-theme-muted text-sm transition-colors duration-300">Select a color palette to instantly rebrand your entire storefront.</p>
        </div>

        {/* CSS-only interactive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {THEME_PRESETS.map((theme) => (
            <label key={theme.id} className="cursor-pointer group relative">
              {/* Hidden Radio Input */}
              <input
                type="radio"
                name="themePreset"
                value={theme.id}
                defaultChecked={currentTheme === theme.id}
                className="peer sr-only"
              />

              {/* Card UI that reacts to peer-checked */}
              <div className="border-2 border-theme-border bg-surface-bg rounded-2xl p-4 transition-all duration-300 peer-checked:border-brand peer-checked:bg-surface-card peer-checked:shadow-lg peer-checked:shadow-brand/20 hover:border-zinc-500">
                {/* Visual Palette Preview */}
                <div
                  className="w-full aspect-video rounded-lg shadow-inner mb-4 flex flex-col overflow-hidden border border-theme-border"
                  style={{ backgroundColor: theme.bg }}
                >
                  <div className="h-1/3 w-full border-b opacity-20" style={{ borderColor: theme.text }} />
                  <div className="flex-1 p-2 flex items-center justify-center gap-2">
                    <div className="w-1/2 h-full rounded shadow" style={{ backgroundColor: theme.card }} />
                    <div className="w-1/3 h-full rounded shadow" style={{ backgroundColor: theme.primary }} />
                  </div>
                </div>

                <p className="text-sm font-bold text-theme-main text-center transition-colors duration-300">{theme.name}</p>
              </div>

              {/* Checkmark overlay for active theme */}
              <div className="absolute -top-3 -right-3 bg-brand text-black w-8 h-8 rounded-full flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-all shadow-lg scale-0 peer-checked:scale-100 duration-300 z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </label>
          ))}
        </div>

        <div className="pt-6 border-t border-theme-border flex justify-end transition-colors duration-300">
          <Button type="submit" className="bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest px-8 h-12 rounded-xl transition-all duration-300 shadow-lg shadow-brand/20 active:scale-95">
            <Save className="mr-2 h-5 w-5" /> Apply Global Theme
          </Button>
        </div>
      </form>
    </div>
  );
}