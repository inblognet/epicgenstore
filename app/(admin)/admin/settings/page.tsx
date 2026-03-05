// app/(admin)/admin/settings/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Save, Settings, ImageIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { CarouselManager } from "@/components/admin/carousel-manager";
import { Prisma } from "@prisma/client";
import { AdminNav } from "@/components/admin/admin-nav";

export interface CarouselItem {
  url: string;
  link: string;
}

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  let settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.siteSetting.create({
      data: {
        id: 1,
        carouselItems: [],
      }
    });
  }

  async function updateSettings(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const carouselJson = formData.get("carouselItems") as string;
    const carouselItems: CarouselItem[] = carouselJson ? JSON.parse(carouselJson) : [];

    const formHeroUrl = formData.get("heroImageUrl") as string;
    const firstCarouselUrl = carouselItems.length > 0 ? carouselItems[0].url : "";
    const defaultHeroUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";

    await prisma.siteSetting.update({
      where: { id: 1 },
      data: {
        storeName: (formData.get("storeName") as string) || "EPIC STORE",
        heroTitle: formData.get("heroTitle") as string,
        heroSubtitle: formData.get("heroSubtitle") as string,
        heroImageUrl: formHeroUrl || firstCarouselUrl || defaultHeroUrl,
        latestArrivalsTitle: formData.get("latestArrivalsTitle") as string,
        footerAboutText: formData.get("footerAboutText") as string,

        // Dynamic Navbar & Contact fields
        contactAddress: formData.get("contactAddress") as string,
        contactPhone: formData.get("contactPhone") as string,
        contactEmail: formData.get("contactEmail") as string,
        promoBanner: formData.get("promoBanner") as string,

        // Social Links
        facebookUrl: (formData.get("facebookUrl") as string) || "",
        instagramUrl: (formData.get("instagramUrl") as string) || "",
        twitterUrl: (formData.get("twitterUrl") as string) || "",
        youtubeUrl: (formData.get("youtubeUrl") as string) || "",

        carouselItems: carouselItems as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-theme-main font-sans transition-colors duration-300">
      <AdminNav />

      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-brand transition-colors duration-300" />
        <h1 className="text-3xl font-extrabold tracking-tight">Site Configuration</h1>
      </div>

      <form action={updateSettings} className="space-y-8">

        {/* --- CAROUSEL SECTION --- */}
        <div className="bg-surface-card border border-theme-border rounded-xl shadow-lg p-6 md:p-8 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="h-6 w-6 text-brand transition-colors duration-300" />
            <h2 className="text-xl font-bold text-theme-main">Homepage Carousel</h2>
          </div>
          <p className="text-sm text-theme-muted mb-6">Add multiple images to the main homepage slider. Recommended size: 1920x800px.</p>
          <CarouselManager initialItems={(settings.carouselItems as unknown as CarouselItem[]) || []} />
        </div>

        <div className="bg-surface-card border border-theme-border rounded-xl shadow-lg p-6 md:p-8 space-y-8 transition-colors duration-300">

          {/* --- GENERAL BRANDING & NAVBAR SECTION --- */}
          <div className="space-y-4 border-b border-theme-border pb-8">
            <h2 className="text-xl font-bold text-brand transition-colors duration-300">General Branding & Navbar</h2>
            <div className="grid grid-cols-1 gap-6">

              {/* Store Name Input */}
              <div className="space-y-2 bg-surface-bg/50 p-4 rounded-xl border border-theme-border transition-colors duration-300">
                <label className="text-xs font-black text-brand uppercase tracking-widest flex items-center gap-2 transition-colors duration-300">
                  <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse transition-colors duration-300" /> Global Store Name (Navbar)
                </label>
                <input
                  type="text"
                  name="storeName"
                  defaultValue={settings.storeName || "EPIC STORE"}
                  className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300 font-bold"
                />
              </div>

              {/* Navbar Promo Banner */}
              <div className="space-y-2">
                <label className="text-xs font-black text-theme-muted uppercase tracking-widest">Navbar Promo Banner</label>
                <input type="text" name="promoBanner" defaultValue={settings.promoBanner || ""} placeholder="Island Wide Express Delivery Available" className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>

            </div>
          </div>

          {/* --- HOMEPAGE HERO SECTION --- */}
          <div className="space-y-4 border-b border-theme-border pb-8">
            <h2 className="text-xl font-bold text-brand transition-colors duration-300">Homepage Hero Text</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-theme-muted uppercase tracking-widest">Hero Title</label>
                <input type="text" name="heroTitle" defaultValue={settings.heroTitle} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-theme-muted uppercase tracking-widest">Hero Subtitle</label>
                <input type="text" name="heroSubtitle" defaultValue={settings.heroSubtitle} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-theme-muted uppercase tracking-widest">Fallback Hero Image URL</label>
                <input type="url" name="heroImageUrl" defaultValue={settings.heroImageUrl} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-2 pt-4 border-t border-theme-border">
                <label className="text-xs font-black text-theme-muted uppercase tracking-widest">Promotions Section Header</label>
                <input type="text" name="latestArrivalsTitle" defaultValue={settings.latestArrivalsTitle} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
            </div>
          </div>

          {/* --- FOOTER & CONTACT SECTION --- */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-brand transition-colors duration-300">Footer & Contact Details</h2>
            <div className="space-y-2">
              <label className="text-xs font-black text-theme-muted uppercase tracking-widest">Footer &quot;About Us&quot; Text</label>
              <textarea name="footerAboutText" defaultValue={settings.footerAboutText} rows={3} className="flex w-full rounded-xl border border-theme-border bg-surface-bg p-4 text-theme-main focus:border-brand outline-none transition-all duration-300 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase">Address</label>
                <input type="text" name="contactAddress" defaultValue={settings.contactAddress} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase">Phone (Navbar & Footer)</label>
                <input type="text" name="contactPhone" defaultValue={settings.contactPhone} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase">Email (Navbar & Footer)</label>
                <input type="email" name="contactEmail" defaultValue={settings.contactEmail} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-theme-border">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase">Facebook URL</label>
                <input type="text" name="facebookUrl" defaultValue={settings.facebookUrl || ""} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase">Youtube URL</label>
                <input type="text" name="youtubeUrl" defaultValue={settings.youtubeUrl || ""} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase">Instagram URL</label>
                <input type="text" name="instagramUrl" defaultValue={settings.instagramUrl || ""} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase">Twitter URL</label>
                <input type="text" name="twitterUrl" defaultValue={settings.twitterUrl || ""} className="flex h-12 w-full rounded-xl border border-theme-border bg-surface-bg px-4 text-theme-main focus:border-brand outline-none transition-all duration-300" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-black font-black h-14 rounded-xl transition-all duration-300 shadow-lg shadow-brand/20 active:scale-[0.98]">
              <Save className="mr-2 h-5 w-5" /> Save All Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}