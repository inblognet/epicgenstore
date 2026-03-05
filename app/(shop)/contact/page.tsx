// app/(shop)/contact/page.tsx
import { prisma } from "@/lib/prisma";
import { defaultContactData } from "@/components/admin/contact-page-editor";
import { Phone, MapPin, Mail, Package, Users, Headset, ShieldCheck, Laptop, Monitor, Wrench, Database, ArrowUpCircle, HelpCircle, ShieldAlert, Cpu } from "lucide-react";
import { ContactForm } from "@/components/shop/contact-form";
import * as LucideIcons from "lucide-react";

const RenderIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons[name as keyof typeof LucideIcons] as React.ElementType) || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
};

export default async function ContactPage() {
  const settings = await prisma.siteSetting.findFirst();
  const rawData = settings?.contactPageData as unknown as Partial<typeof defaultContactData> | null;
  const data = (rawData && rawData.hero) ? (rawData as typeof defaultContactData) : defaultContactData;

  const renderTitle = (title: string) => {
    if (!title) return "Contact MSK COMPUTERS";
    const parts = title.split("MSK COMPUTERS");
    if (parts.length === 1) return title;
    // REPLACED: text-yellow-500 -> text-brand
    return <>{parts[0]} <span className="text-brand transition-colors duration-300">MSK COMPUTERS</span> {parts[1]}</>;
  };

  return (
    // REPLACED: bg-black -> bg-surface-bg
    <div className="bg-surface-bg min-h-screen text-zinc-50 font-sans pb-24 transition-colors duration-300">

      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 pt-20 pb-16 max-w-4xl text-center">
        {/* REPLACED: border-yellow-500/30 text-yellow-500 -> border-brand/30 text-brand */}
        <div className="inline-flex items-center gap-2 bg-transparent border border-brand/30 text-brand px-4 py-1.5 rounded-full text-xs font-medium mb-8 transition-colors duration-300">
          <Phone className="w-3.5 h-3.5" /> {data.hero.badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          {renderTitle(data.hero.title)}
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
          {data.hero.subtitle}
        </p>
      </section>

      {/* 2. STATS GRID */}
      <section className="container mx-auto px-4 pb-16 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(data.stats).map((stat, i) => (
            // REPLACED: bg-[#121212] -> bg-surface-card
            <div key={i} className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 flex flex-col items-center text-center transition-colors duration-300">
              {/* REPLACED: bg-zinc-900 -> bg-surface-bg */}
              <div className="w-10 h-10 bg-surface-bg border border-zinc-800/50 rounded-lg flex items-center justify-center mb-4 text-purple-500 transition-colors duration-300">
                <RenderIcon name={stat.icon} className="w-5 h-5" />
              </div>
              {/* REPLACED: text-yellow-500 -> text-brand */}
              <h3 className="text-xl font-bold text-brand mb-1 transition-colors duration-300">{stat.value}</h3>
              <p className="text-xs text-zinc-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FORM & STORE INFO */}
      <section className="container mx-auto px-4 pb-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Contact Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Right: Store Info & Hours */}
          <div className="lg:col-span-2 space-y-6">
            {/* REPLACED: bg-[#121212] -> bg-surface-card */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
              <h3 className="text-xl font-bold text-white mb-6">Visit Our Store</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  {/* REPLACED: bg-yellow-500/10 text-yellow-500 -> bg-brand/10 text-brand */}
                  <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">MSK COMPUTERS</h4>
                    <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{data.store.address}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{data.store.phone}</h4>
                    <p className="text-xs text-zinc-500">Call us anytime</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{data.store.email}</h4>
                    <p className="text-xs text-zinc-500">Expert support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* REPLACED: bg-[#121212] -> bg-surface-card */}
            <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
              <h3 className="text-xl font-bold text-white mb-6">Business Hours</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50">
                  <span className="text-sm text-zinc-400">Monday to Friday</span>
                  {/* REPLACED: text-yellow-500 -> text-brand */}
                  <span className="text-sm font-bold text-brand transition-colors duration-300">{data.store.hoursWeek}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50">
                  <span className="text-sm text-zinc-400">Saturday to Sunday</span>
                  {/* REPLACED: text-yellow-500 -> text-brand */}
                  <span className="text-sm font-bold text-brand transition-colors duration-300">{data.store.hoursWeekend}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4">
                  <span className="text-sm text-red-400 font-bold">Closed on Poya Days</span>
                  <span className="text-sm font-bold text-red-500">{data.store.hoursClosed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES GRID (Static as per Mockup) */}
      {/* REPLACED: bg-[#0a0a0a] -> bg-surface-card/30 */}
      <section className="bg-surface-card/30 py-20 border-y border-zinc-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Our Services</h2>
            <p className="text-zinc-500 text-sm">Complete computer solutions for all your needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Laptop, title: "Laptop Sales", desc: "Latest laptops from top brands", color: "text-blue-500" },
              { icon: Monitor, title: "Desktop PCs", desc: "Custom and pre-built cooling solutions", color: "text-green-500" },
              { icon: Wrench, title: "Computer Repair", desc: "Professional repair services", color: "text-purple-500" },
              { icon: Database, title: "Data Recovery", desc: "Recover lost data safely", color: "text-orange-500" },
              { icon: ArrowUpCircle, title: "Upgrades", desc: "Hardware upgrades and improvements", color: "text-red-500" },
              { icon: Headset, title: "Technical Support", desc: "Expert technical assistance", color: "text-cyan-500" },
              // Left this yellow as it's part of the multi-color array, not a branding accent
              { icon: ShieldAlert, title: "Warranty Service", desc: "Comprehensive warranty support", color: "text-yellow-500" },
              { icon: Cpu, title: "Custom Builds", desc: "Tailored PC builds for your needs", color: "text-pink-500" }
            ].map((srv, i) => (
              // REPLACED: bg-[#121212] -> bg-surface-card
              <div key={i} className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 text-center hover:border-zinc-600 transition-colors duration-300">
                {/* REPLACED: bg-zinc-900 -> bg-surface-bg */}
                <div className="w-10 h-10 bg-surface-bg border border-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                  <srv.icon className={`w-5 h-5 ${srv.color}`} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{srv.title}</h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FIND US ON MAP */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Find Us on the Map</h2>
            <p className="text-zinc-500 text-sm">Conveniently located for easy access to all our services</p>
          </div>

          {/* REPLACED: bg-[#121212] -> bg-surface-card */}
          <div className="bg-surface-card border border-zinc-800/50 rounded-3xl overflow-hidden relative shadow-2xl transition-colors duration-300">
            <div className="w-full h-[400px] md:h-[500px]">
              <iframe
                src={data.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(100%)" }} // CSS trick to make Google Maps dark mode!
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Overlay Info Bar */}
            {/* REPLACED: bg-[#0a0a0a]/90 -> bg-surface-bg/90 */}
            <div className="absolute bottom-0 left-0 right-0 bg-surface-bg/90 backdrop-blur-md border-t border-zinc-800/50 p-6 transition-colors duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-3">
                  {/* REPLACED: text-yellow-500 -> text-brand */}
                  <MapPin className="text-brand w-5 h-5 flex-shrink-0 transition-colors duration-300" />
                  <span className="text-zinc-300 font-medium">No.296/3B, Delpe Junction, Ragama</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-brand w-5 h-5 flex-shrink-0 transition-colors duration-300" />
                  <span className="text-zinc-300 font-medium">{data.store.phone.split('/')[0]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-brand w-5 h-5 flex-shrink-0 transition-colors duration-300" />
                  <span className="text-zinc-300 font-medium">{data.store.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}