// components/homepage/CustomerExperiencesCarousel.tsx
import { Sparkles } from "lucide-react";

interface CustomerExperienceImage {
  id: string;
  url: string;
  altText: string | null;
}

export function CustomerExperiencesCarousel({ images }: { images: CustomerExperienceImage[] }) {
  if (!images || images.length === 0) return null;

  // IMPORTANT FOR INFINITE LOOP:
  // We duplicate the image set 4 times to ensure we always have
  // enough cards to cover the screen during the translation animation.
  const multipliedImages = [...images, ...images, ...images, ...images];

  return (
    // REPLACED: bg-black -> bg-surface-bg, border-zinc-900 -> border-surface-card
    <section className="bg-surface-bg py-20 relative overflow-hidden border-t border-surface-card transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl text-center mb-16 relative z-10">
        {/* Header Badge */}
        {/* REPLACED: border-yellow-500/30 text-yellow-500 -> border-brand/30 text-brand */}
        <div className="inline-flex items-center gap-2 bg-transparent border border-brand/30 text-brand px-4 py-1.5 rounded-full text-xs font-medium mb-8 transition-colors duration-300">
          <Sparkles className="w-3.5 h-3.5" /> Our Happy Customers
        </div>

        {/* Main Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
          Customer Experiences
        </h2>

        {/* Subtitle text */}
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
          Join thousands of satisfied customers who trust us for their technology needs
        </p>
      </div>

      {/* --- ADVANCED SHADOW FADE EFFECT --- */}
      {/* This container defines the "view window" where images scroll constantly */}
      <div className="relative group hover-pause">
        {/* Carousel Tracks - Uses CSS animate-marquee defined in globals.css */}
        <div className="flex gap-4 animate-marquee pb-4">
          {multipliedImages.map((img, index) => (
            <div
              // unique key needed since we duplicated items
              key={`${img.id}-${index}`}
              // REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-card border-zinc-800/50
              className="flex-shrink-0 w-[240px] md:w-[320px] bg-surface-card border border-zinc-800/50 rounded-3xl p-2 group/card overflow-hidden shadow-2xl aspect-[3/4] transition-colors duration-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText || "Happy Customer"}
                className="object-cover w-full h-full rounded-2xl transition-transform duration-700 group-hover/card:scale-105"
              />
            </div>
          ))}
        </div>

        {/* --- DENSE DARK SHADOW OVERLAYS (No Blur) --- */}
        {/* REPLACED: from-black via-black/90 -> from-surface-bg via-surface-bg/90 */}
        {/* This ensures the fade seamlessly matches whatever theme background is active! */}
        <div className="absolute top-0 left-0 h-full w-[20%] bg-gradient-to-r from-surface-bg via-surface-bg/90 to-transparent pointer-events-none z-20 transition-colors duration-300" />

        {/* End (Right) Shadow: Transparent fading back to the theme background */}
        <div className="absolute top-0 right-0 h-full w-[20%] bg-gradient-to-l from-surface-bg via-surface-bg/90 to-transparent pointer-events-none z-20 transition-colors duration-300" />
      </div>
    </section>
  );
}