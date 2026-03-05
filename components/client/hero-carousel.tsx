"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselItem } from "@/app/(admin)/admin/settings/page";

export function HeroCarousel({ items }: { items: CarouselItem[] }) {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [items.length, nextSlide]);

  if (!items || items.length === 0) return null;

  return (
    <section className="relative h-[65vh] min-h-[550px] overflow-hidden bg-surface-bg group transition-colors duration-300">
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-linear ${
              index === current ? "scale-110" : "scale-100"
            }`}
            alt={`Promotion ${index + 1}`}
          />

          {/* FIXED: Locked the shadow strictly to the bottom 1/3 of the screen so it doesn't wash out the middle/top of the image */}
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-surface-bg to-transparent transition-colors duration-300" />

          <div className="absolute inset-0 flex items-center justify-center text-center p-4">
            <div className={`transition-all duration-700 transform ${
              index === current ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}>
              <Link
                href={item.link}
                className="bg-brand hover:bg-brand-hover text-black font-black py-4 px-10 rounded-full text-lg shadow-xl shadow-brand/20 transition-all hover:scale-105 active:scale-95 block"
              >
                Shop The Collection
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Manual Controls */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-surface-card/80 text-theme-main opacity-0 group-hover:opacity-100 transition-all hover:bg-brand hover:text-black shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-surface-card/80 text-theme-main opacity-0 group-hover:opacity-100 transition-all hover:bg-brand hover:text-black shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-brand w-8" : "bg-theme-border hover:bg-theme-muted w-2"
            }`}
          />
        ))}
      </div>
    </section>
  );
}