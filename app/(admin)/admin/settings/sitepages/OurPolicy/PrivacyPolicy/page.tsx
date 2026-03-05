import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { PrivacyPolicyEditor, defaultPrivacyData } from "@/components/admin/privacy-policy-editor";

export default async function AdminPrivacyPolicySettings() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const settings = await prisma.siteSetting.findFirst();
  const initialData = settings?.privacyPolicyData
    ? (settings.privacyPolicyData as unknown as Partial<typeof defaultPrivacyData>)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl text-zinc-50 font-sans pb-24">
      <Link href="/admin/settings" className="inline-flex items-center text-xs font-black text-zinc-500 hover:text-yellow-500 mb-8 uppercase tracking-widest transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Settings
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-black uppercase tracking-tight italic">Privacy Policy Editor</h1>
      </div>
      <PrivacyPolicyEditor initialData={initialData} />
    </div>
  );
}