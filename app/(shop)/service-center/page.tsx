// app/(shop)/service-center/page.tsx
import { prisma } from "@/lib/prisma";
import * as LucideIcons from "lucide-react";
import { defaultServiceData } from "@/components/admin/service-page-editor";

// 1. Define exact structures to satisfy TypeScript and ESLint
interface ServiceItem {
  icon: string;
  category: string;
  title: string;
  desc: string;
  points: string[];
}

interface ReasonItem {
  icon: string;
  title: string;
  desc: string;
  points: string[];
}

interface ProcessItem {
  num: string;
  title: string;
  desc: string;
}

const RenderIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons[name as keyof typeof LucideIcons] as React.ElementType) || LucideIcons.Wrench;
  return <IconComponent className={className} />;
};

export default async function ServiceCenterPage() {
  const settings = await prisma.siteSetting.findFirst();

  const rawData = settings?.servicePageData as unknown as Partial<typeof defaultServiceData> | null;

  const data = (rawData && rawData.hero)
    ? (rawData as typeof defaultServiceData)
    : defaultServiceData;

  const renderTitle = (title: string) => {
    if (!title) return "Professional Computer Repair Services";

    const parts = title.split("Repair");
    if (parts.length === 1) return title;
    // REPLACED: text-yellow-500 -> text-brand
    return <>{parts[0]} <span className="text-brand transition-colors duration-300">Repair</span> {parts[1]}</>;
  };

  return (
    // REPLACED: bg-black -> bg-surface-bg
    <div className="bg-surface-bg min-h-screen text-zinc-50 font-sans pb-24 transition-colors duration-300">

      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 pt-20 pb-16 max-w-5xl text-center">
        {/* REPLACED: border-yellow-500/30 text-yellow-500 -> border-brand/30 text-brand */}
        <div className="inline-flex items-center gap-2 bg-transparent border border-brand/30 text-brand px-4 py-1.5 rounded-full text-xs font-medium mb-8 transition-colors duration-300">
          <LucideIcons.Wrench className="w-3.5 h-3.5" /> Service Center
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          {renderTitle(data.hero.title)}
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base leading-relaxed mb-16">
          {data.hero.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* REPLACED: bg-[#121212] -> bg-surface-card */}
          <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center text-center transition-colors duration-300">
            {/* REPLACED: bg-zinc-900 text-yellow-500 -> bg-surface-bg text-brand */}
            <div className="w-12 h-12 bg-surface-bg border border-zinc-800/50 rounded-xl flex items-center justify-center mb-4 text-brand transition-colors duration-300">
              <LucideIcons.MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{data.hero.locationTitle}</h3>
            <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{data.hero.locationDesc}</p>
          </div>

          <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center text-center transition-colors duration-300">
            <div className="w-12 h-12 bg-surface-bg border border-zinc-800/50 rounded-xl flex items-center justify-center mb-4 text-brand transition-colors duration-300">
              <LucideIcons.Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{data.hero.phoneTitle}</h3>
            {/* REPLACED: text-yellow-500 -> text-brand */}
            <p className="text-sm text-brand font-bold transition-colors duration-300">{data.hero.phoneDesc}</p>
          </div>

          <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center text-center transition-colors duration-300">
            <div className="w-12 h-12 bg-surface-bg border border-zinc-800/50 rounded-xl flex items-center justify-center mb-4 text-brand transition-colors duration-300">
              <LucideIcons.MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{data.hero.whatsappTitle}</h3>
            {/* REPLACED: text-yellow-500 -> text-brand */}
            <p className="text-sm text-brand font-bold transition-colors duration-300">{data.hero.whatsappDesc}</p>
          </div>
        </div>
      </section>

      {/* 2. OUR SERVICES GRID */}
      {/* REPLACED: bg-[#0a0a0a] -> bg-surface-card/30 for alternate section background */}
      <section className="bg-surface-card/30 py-20 border-y border-zinc-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">{data.services.title}</h2>
            <p className="text-zinc-400 text-sm">{data.services.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.items.map((service: ServiceItem, i: number) => (
              // REPLACED: bg-[#121212] hover:border-zinc-700 -> bg-surface-card hover:border-brand/50
              <div key={i} className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 hover:border-brand/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-surface-bg border border-zinc-800/50 rounded-xl flex items-center justify-center mb-6 text-brand transition-colors duration-300">
                  <RenderIcon name={service.icon} className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{service.category}</h3>
                {/* REPLACED: text-yellow-500 -> text-brand */}
                <h4 className="text-sm font-medium text-brand mb-4 transition-colors duration-300">{service.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">{service.desc}</p>
                <ul className="space-y-3">
                  {service.points.map((point: string, j: number) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-zinc-300">
                      {/* REPLACED: bg-yellow-500 -> bg-brand */}
                      <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0 transition-colors duration-300" /> {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">{data.reasons?.title || "Why Choose Our Service Center?"}</h2>
            <p className="text-zinc-400 text-sm">{data.reasons?.subtitle || "Professional service with comprehensive warranty and expert support"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data.reasons?.items || []).map((reason: ReasonItem, i: number) => (
              <div key={i} className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 text-center transition-colors duration-300">
                <div className="w-12 h-12 bg-surface-bg border border-zinc-800/50 rounded-xl flex items-center justify-center mb-6 mx-auto text-brand transition-colors duration-300">
                  <RenderIcon name={reason.icon} className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{reason.title}</h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{reason.desc}</p>
                <ul className="space-y-3 text-left">
                  {reason.points.map((point: string, j: number) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0 transition-colors duration-300" /> {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SERVICE PROCESS */}
      <section className="bg-surface-card/30 py-20 border-y border-zinc-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">{data.process?.title || "Our Service Process"}</h2>
            <p className="text-zinc-400 text-sm">{data.process?.subtitle || "Simple and transparent process for all repairs"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-12 right-12 h-px bg-zinc-800/50 transition-colors duration-300" />

            {(data.process?.items || []).map((step: ProcessItem, i: number) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* REPLACED: bg-yellow-500 -> bg-brand */}
                <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-black font-black text-xl z-10 mb-6 transition-colors duration-300 shadow-lg shadow-brand/20">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">{data.cta.title}</h2>
            <p className="text-zinc-400 text-sm">{data.cta.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Left Card - Details */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors duration-300">
              <h3 className="text-xl font-bold text-white mb-2">{data.cta.companyName}</h3>
              <p className="text-sm text-zinc-400 whitespace-pre-wrap mb-6">
                {data.hero.locationDesc}
              </p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-brand transition-colors duration-300">Call: {data.hero.phoneDesc}</p>
                <p className="text-sm font-bold text-brand transition-colors duration-300">WhatsApp: {data.hero.whatsappDesc}</p>
              </div>
            </div>

            {/* Right Card - Buttons */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 flex flex-col justify-center gap-4 transition-colors duration-300">
              {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover */}
              <a href={`tel:${data.hero.phoneDesc}`} className="w-full bg-brand hover:bg-brand-hover text-black font-bold py-3.5 px-6 rounded-lg text-center transition-colors duration-300 shadow-lg shadow-brand/20">
                Call Now: {data.hero.phoneDesc}
              </a>
              {/* Left WhatsApp as default brand green, as it's a recognizable brand color */}
              <a href={`https://wa.me/${data.hero.whatsappDesc.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-3.5 px-6 rounded-lg text-center transition-colors">
                WhatsApp: {data.hero.whatsappDesc}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}