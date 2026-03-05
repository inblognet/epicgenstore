// app/(admin)/admin/settings/quotation/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminQuotationPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });

  async function updateQuotationSettings(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.siteSetting.update({
      where: { id: 1 },
      data: {
        quotationLogoUrl: formData.get("quotationLogoUrl") as string,
        quotationAddress: formData.get("quotationAddress") as string,
        quotationEmail: formData.get("quotationEmail") as string,
        quotationPhone: formData.get("quotationPhone") as string,
        quotationWebsite: formData.get("quotationWebsite") as string,
      },
    });

    revalidatePath("/quotation/print");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-theme-main font-sans pb-24 transition-colors duration-300">
      <AdminNav />

      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-brand transition-colors duration-300" />
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-main transition-colors duration-300">Quotation Editor</h1>
      </div>

      <form action={updateQuotationSettings} className="bg-surface-card border border-theme-border rounded-3xl p-6 md:p-10 shadow-2xl transition-colors duration-300 flex flex-col gap-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-theme-muted uppercase tracking-wider">Quotation Logo URL</label>
            <input
              name="quotationLogoUrl"
              defaultValue={settings?.quotationLogoUrl || ""}
              placeholder="https://your-image-url.com/logo.png"
              className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-theme-muted uppercase tracking-wider">Company Address</label>
            <input
              name="quotationAddress"
              defaultValue={settings?.quotationAddress || ""}
              placeholder="64/A, Kandy Road, Yakkala"
              className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-theme-muted uppercase tracking-wider">Website Link</label>
            <input
              name="quotationWebsite"
              defaultValue={settings?.quotationWebsite || ""}
              placeholder="https://epicstore.lk"
              className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-theme-muted uppercase tracking-wider">Hotline / Phone</label>
            <input
              name="quotationPhone"
              defaultValue={settings?.quotationPhone || ""}
              placeholder="076 123 4567"
              className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-theme-muted uppercase tracking-wider">Email Address</label>
            <input
              name="quotationEmail"
              defaultValue={settings?.quotationEmail || ""}
              placeholder="info@epicstore.lk"
              className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-theme-border flex justify-end transition-colors duration-300">
          <Button type="submit" className="bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest px-8 h-12 rounded-xl transition-all duration-300 shadow-lg shadow-brand/20 active:scale-95">
            <Save className="mr-2 h-5 w-5" /> Save Template
          </Button>
        </div>
      </form>
    </div>
  );
}