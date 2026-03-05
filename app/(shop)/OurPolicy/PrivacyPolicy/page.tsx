import { prisma } from "@/lib/prisma";
import { defaultPrivacyData } from "@/components/admin/privacy-policy-editor";

interface PolicySection {
  title: string;
  content: string;
}

export default async function PrivacyPolicyPage() {
  const settings = await prisma.siteSetting.findFirst();

  // 1. Safely type the raw data
  const rawData = settings?.privacyPolicyData as unknown as Partial<typeof defaultPrivacyData> | null;

  // 2. ULTRA-STRICT FALLBACK: Ensure rawData, header, and title all explicitly exist
  const data = (rawData && rawData.header && rawData.header.title)
    ? (rawData as typeof defaultPrivacyData)
    : defaultPrivacyData;

  // Helper function to format the text content:
  // It converts standard text into paragraphs, and lines starting with "-" into brand-colored bullet points.
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-3 mt-2 ml-4">
            {/* REPLACED: bg-yellow-500 -> bg-brand */}
            <div className="w-1.5 h-1.5 rounded-sm bg-brand mt-1.5 flex-shrink-0 transition-colors duration-300" />
            <p className="text-sm text-zinc-300 leading-relaxed">{line.replace('-', '').trim()}</p>
          </div>
        );
      }
      if (line.trim().match(/^\d+\.\d+/)) { // Matches subheadings like "2.1"
        return <h4 key={index} className="text-sm font-bold text-white mt-6 mb-2">{line}</h4>;
      }
      return line.trim() ? <p key={index} className="text-sm text-zinc-400 leading-relaxed mt-4">{line}</p> : null;
    });
  };

  return (
    // REPLACED: bg-black -> Removed so app/layout.tsx background handles it automatically
    <div className="min-h-screen text-zinc-50 font-sans pb-24 transition-colors duration-300">

      {/* 1. HEADER */}
      <section className="container mx-auto px-4 pt-20 pb-10 max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          {data.header.title}
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          {data.header.lastUpdated}
        </p>
      </section>

      {/* 2. POLICY DOCUMENT CARD */}
      <section className="container mx-auto px-4 max-w-4xl">
        {/* REPLACED: bg-[#121212] border-zinc-800/50 -> bg-surface-card border-zinc-800/50 */}
        <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 md:p-12 shadow-2xl transition-colors duration-300">

          {/* Dynamic Policy Sections */}
          <div className="space-y-12">
            {data.sections.map((section: PolicySection, i: number) => (
              <div key={i}>
                <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
                <div className="space-y-1">
                  {renderContent(section.content)}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Box (Footer of the policy) */}
          <div className="mt-16 pt-12 border-t border-zinc-800/50 transition-colors duration-300">
            <h2 className="text-xl font-bold text-white mb-4">{data.contact.title}</h2>
            <p className="text-sm text-zinc-400 mb-6">{data.contact.desc}</p>

            {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 */}
            <div className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-6 transition-colors duration-300">
              {/* REPLACED: text-yellow-500 -> text-brand */}
              <p className="text-brand font-bold text-sm mb-2 transition-colors duration-300">{data.contact.companyName}</p>
              <p className="text-sm text-zinc-300 mb-1">
                Email: <a href={`mailto:${data.contact.email}`} className="text-brand hover:underline transition-colors duration-300">{data.contact.email}</a>
              </p>
              <p className="text-sm text-zinc-300 mb-1">Phone: {data.contact.phone}</p>
              <p className="text-sm text-zinc-300 mt-4 text-zinc-500">Address: {data.contact.address}</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}