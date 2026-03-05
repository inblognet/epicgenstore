// app/(shop)/about/page.tsx
import { prisma } from "@/lib/prisma";
import { defaultAboutData } from "@/components/admin/about-page-editor";
import { Info, Target, Eye, ShieldCheck, MapPin, Wrench, Award, Truck, AlertTriangle, ShieldAlert } from "lucide-react";

export default async function AboutPage() {
  const settings = await prisma.siteSetting.findFirst();

  const rawData = settings?.aboutPageData as unknown as Partial<typeof defaultAboutData> | null;
  const data = (rawData && rawData.hero) ? (rawData as typeof defaultAboutData) : defaultAboutData;

  const renderTitle = (title: string) => {
    if (!title) return "About MSK COMPUTERS";
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
          <Info className="w-3.5 h-3.5" /> {data.hero.badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          {renderTitle(data.hero.title)}
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
          {data.hero.subtitle}
        </p>
      </section>

      {/* 2. VISION & MISSION */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* REPLACED: bg-[#121212] -> bg-surface-card */}
          <div className="bg-surface-card border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-500/40 transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-blue-500 font-bold mb-2 text-lg">{data.visionMission.visionTitle}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{data.visionMission.visionDesc}</p>
              </div>
            </div>
          </div>
          {/* REPLACED: bg-[#121212] border-yellow-500/20 hover:border-yellow-500/40 -> bg-surface-card border-brand/20 hover:border-brand/40 */}
          <div className="bg-surface-card border border-brand/20 rounded-2xl p-8 relative overflow-hidden group hover:border-brand/40 transition-colors duration-300">
            <div className="flex items-start gap-4">
              {/* REPLACED: bg-yellow-500/10 -> bg-brand/10 */}
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                {/* REPLACED: text-yellow-500 -> text-brand */}
                <Target className="w-6 h-6 text-brand transition-colors duration-300" />
              </div>
              <div>
                {/* REPLACED: text-yellow-500 -> text-brand */}
                <h3 className="text-brand font-bold mb-2 text-lg transition-colors duration-300">{data.visionMission.missionTitle}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{data.visionMission.missionDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY */}
      <section className="container mx-auto px-4 pb-20 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-8">Our Story</h2>
        {/* REPLACED: bg-[#121212] -> bg-surface-card */}
        <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 md:p-10 transition-colors duration-300">
          <p className="text-zinc-400 text-sm leading-loose">
            {data.story}
          </p>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      {/* REPLACED: bg-[#0a0a0a] -> bg-surface-card/30 */}
      <section className="bg-surface-card/30 py-20 border-y border-zinc-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Why Choose MSK COMPUTERS</h2>
            <p className="text-zinc-500 text-sm">Trusted enterprise hardware partner across Sri Lanka</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Genuine Products", desc: "100% authentic hardware" },
              { icon: Truck, title: "Islandwide", desc: "Fast delivery anywhere" },
              { icon: ShieldAlert, title: "Quality Warranty", desc: "Comprehensive protection" },
              { icon: Wrench, title: "Expert Support", desc: "Professional tech assistance" }
            ].map((feature, i) => (
              // REPLACED: bg-[#121212] hover:border-yellow-500/30 -> bg-surface-card hover:border-brand/50
              <div key={i} className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 text-center hover:border-brand/50 transition-colors duration-300">
                {/* REPLACED: bg-zinc-900 text-yellow-500 -> bg-surface-bg text-brand */}
                <div className="w-12 h-12 bg-surface-bg border border-zinc-800/50 rounded-xl flex items-center justify-center mb-4 mx-auto text-brand transition-colors duration-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{feature.title}</h3>
                <p className="text-xs text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WARRANTY TERMS (Complex Section from Image) */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">වගකීම් සහතිකය හා අදාළ කොන්දේසි</h2>
            <p className="text-zinc-400 text-sm">Warranty Conditions and Related Terms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             {/* REPLACED: bg-[#121212] -> bg-surface-card */}
             <div className="bg-surface-card border border-red-500/20 rounded-xl p-6 transition-colors duration-300">
                <h4 className="text-red-500 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> No Warranty</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">No warranty for physical damage, burn marks, liquid damage, or removal of warranty stickers.</p>
             </div>
             <div className="bg-surface-card border border-orange-500/20 rounded-xl p-6 transition-colors duration-300">
                <h4 className="text-orange-500 font-bold text-sm mb-2 flex items-center gap-2"><Info className="w-4 h-4"/> Warranty Claim Duration</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">Warranty claims may take 14-30 working days to process depending on the local agent.</p>
             </div>
             <div className="bg-surface-card border border-blue-500/20 rounded-xl p-6 transition-colors duration-300">
                <h4 className="text-blue-500 font-bold text-sm mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Presenting Bills</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">Original invoice/bill must be presented for any warranty claim. No exceptions.</p>
             </div>
          </div>

          {/* REPLACED: bg-[#121212] -> bg-surface-card */}
          <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 mb-6 transition-colors duration-300">
            <h3 className="text-white font-bold mb-6">Warranty Parts Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" /> Processor / RAM (3 Years)</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" /> Motherboard / VGA (3 Years)</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" /> Hard Drive / SSD (3 Years)</li>
              </ul>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" /> Power Supply (1-3 Years based on model)</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" /> Casing / Fans (No Warranty)</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" /> Accessories (6 Months - 1 Year)</li>
              </ul>
            </div>
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-bold">
              Important: Removing the processor from the motherboard by unauthorized personnel will void the warranty.
            </div>
          </div>
        </div>
      </section>

      {/* 6. DELIVERY & AFTER SALES */}
      {/* REPLACED: bg-[#0a0a0a] -> bg-surface-card/30 */}
      <section className="bg-surface-card/30 py-20 border-y border-zinc-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">ඩිලිවරි කරනු ලබන ආකාරයේ විස්තර</h2>
            <p className="text-zinc-400 text-sm">Delivery & Service Details</p>
          </div>

          {/* Pricing Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* REPLACED: bg-[#121212] -> bg-surface-card */}
            <div className="bg-surface-card border border-green-500/20 rounded-2xl p-6 transition-colors duration-300">
              <h3 className="text-green-500 font-bold mb-4 uppercase tracking-widest text-xs">Colombo 1-15</h3>
              <div className="flex justify-between border-b border-zinc-800/50 pb-2 mb-2">
                <span className="text-zinc-400 text-sm">Delivery</span>
                <span className="text-white font-bold text-sm">Rs. 500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Full PC Setup</span>
                <span className="text-white font-bold text-sm">Rs. 1000</span>
              </div>
            </div>
            <div className="bg-surface-card border border-orange-500/20 rounded-2xl p-6 transition-colors duration-300">
              <h3 className="text-orange-500 font-bold mb-4 uppercase tracking-widest text-xs">Outstation Delivery</h3>
              <div className="flex justify-between border-b border-zinc-800/50 pb-2 mb-2">
                <span className="text-zinc-400 text-sm">Standard</span>
                <span className="text-white font-bold text-sm">Rs. 800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Heavy Items (PC/Monitor)</span>
                <span className="text-white font-bold text-sm">Rs. 1500+</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">අලෙවියෙන් පසු සේවාව</h2>
            <p className="text-zinc-400 text-sm">After Sales Service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-surface-card border border-blue-500/20 rounded-2xl p-6 transition-colors duration-300">
                <h4 className="text-blue-500 font-bold text-sm mb-4 flex items-center gap-2"><MapPin className="w-5 h-5"/> In Store Service</h4>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">You can bring your PC directly to our store for diagnostics and repairs.</p>
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-400 text-xs">
                  We highly recommend backing up your data before handing over the device.
                </div>
             </div>
             <div className="bg-surface-card border border-green-500/20 rounded-2xl p-6 transition-colors duration-300">
                <h4 className="text-green-500 font-bold text-sm mb-4 flex items-center gap-2"><Truck className="w-5 h-5"/> Courier Service</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">You can courier your items to us. Please pack them securely to avoid damage during transit.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 7. ACHIEVEMENTS & COMMITMENT */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          {/* REPLACED: text-yellow-500 -> text-brand */}
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-brand transition-colors duration-300" /> Our Achievements
          </h2>
          <p className="text-zinc-400 text-sm mb-12">Recognitions and awards received for our outstanding service in the IT sector.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {(data.achievements && data.achievements.length > 0 ? data.achievements : [1, 2, 3, 4]).map((item: string | number, i: number) => (
              // REPLACED: bg-[#121212] -> bg-surface-card
              <div key={i} className="aspect-[3/4] bg-surface-card border border-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-700 overflow-hidden relative group transition-colors duration-300">
                {typeof item === 'string' && item.trim() !== '' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item}
                    alt={`Achievement ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Award className="w-8 h-8 opacity-50" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-8 transition-colors duration-300">
            <h3 className="text-xl font-bold text-white mb-4">Commitment to Excellence</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {data.commitment}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}