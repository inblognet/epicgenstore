// app/(admin)/admin/settings/sitepages/servicescenter/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { ServicePageEditor, defaultServiceData } from "@/components/admin/service-page-editor";

export default async function AdminServiceCenterSettings() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const settings = await prisma.siteSetting.findFirst();

  // Safely extract the raw JSON data
  const rawData = settings?.servicePageData as unknown as Partial<typeof defaultServiceData> | null;

  // ULTRA-STRICT FALLBACK:
  // We check if the data exists AND if it has the new sections we just added.
  // If the database has old data missing the 'process' or 'cta' sections, we pass null
  // so the Editor will load the full, fresh defaultServiceData instead of crashing.
  const isDataComplete = rawData && rawData.hero && rawData.reasons && rawData.process && rawData.cta;
  const initialData = isDataComplete ? (rawData as typeof defaultServiceData) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl text-zinc-50 font-sans pb-24 transition-colors duration-300">
      {/* REPLACED: hover:text-yellow-500 -> hover:text-brand */}
      <Link href="/admin/settings" className="inline-flex items-center text-xs font-black text-zinc-500 hover:text-brand mb-8 uppercase tracking-widest transition-colors duration-300">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Settings
      </Link>

      <div className="flex items-center gap-3 mb-8">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <Wrench className="h-8 w-8 text-brand transition-colors duration-300" />
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">Service Page Editor</h1>
      </div>

      <ServicePageEditor initialData={initialData} />
    </div>
  );
}