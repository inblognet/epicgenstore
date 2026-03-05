// components/client/product-image-gallery.tsx
"use client";

import { useState } from "react";

interface ProductImageGalleryProps {
  mainImage: string | null;
  subImages: string[];
}

export function ProductImageGallery({ mainImage, subImages = [] }: ProductImageGalleryProps) {
  // Combine the main image and sub-images, filtering out any null/empty strings
  const allImages = [mainImage, ...subImages].filter(Boolean) as string[];

  // Set the first available image as the active one
  const [activeImage, setActiveImage] = useState<string | null>(allImages[0] || null);

  // State for the Zoom Effect
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Calculate mouse position relative to the image container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  if (!activeImage) {
    return (
      // REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50
      <div className="rounded-3xl overflow-hidden bg-surface-card border border-zinc-800/50 aspect-square relative shadow-2xl p-8 flex items-center justify-center transition-colors duration-300">
        <div className="text-zinc-600 font-medium text-lg tracking-widest uppercase">
          No Image Available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Active Image Display with Hover Zoom */}
      {/* REPLACED: bg-[#0a0a0a] border-zinc-800 -> bg-surface-card/50 border-zinc-800/50 */}
      <div
        className="rounded-3xl overflow-hidden bg-surface-card/50 border border-zinc-800/50 aspect-square relative shadow-2xl flex items-center justify-center cursor-crosshair transition-colors duration-300"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt="Product Main"
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: isZooming ? "scale(2.5)" : "scale(1)",
          }}
          className={`w-full h-full object-contain p-8 ${
            isZooming ? "transition-none" : "transition-transform duration-300 ease-out"
          }`}
        />
      </div>

      {/* Thumbnail Gallery Row */}
      {allImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800/50 scrollbar-track-transparent">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              // REPLACED: bg-[#0a0a0a] -> bg-surface-card/50
              // REPLACED: border-yellow-500 shadow-[rgba(234,179,8,0.2)] -> border-brand shadow-brand/20
              className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 overflow-hidden flex-shrink-0 bg-surface-card/50 transition-all duration-300 ${
                activeImage === img
                  ? "border-brand opacity-100 scale-100 shadow-lg shadow-brand/20"
                  : "border-zinc-800/50 opacity-50 hover:opacity-100 hover:border-zinc-600 scale-95"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}