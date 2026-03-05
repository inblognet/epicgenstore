"use client";

import { useState } from "react";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { CarouselItem } from "@/app/(admin)/admin/settings/page";

export function CarouselManager({ initialItems }: { initialItems: CarouselItem[] }) {
  const [items, setItems] = useState<CarouselItem[]>(initialItems || []);

  const addSlide = () => setItems([...items, { url: "", link: "/products" }]);
  const removeSlide = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateSlide = (index: number, field: keyof CarouselItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-4 p-5 bg-zinc-950 border border-zinc-800 rounded-2xl relative group">
          <div className="flex gap-6 items-start">

            {/* --- LIVE PREVIEW THUMBNAIL --- */}
            <div className="w-24 h-24 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "")}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-zinc-700" />
              )}
            </div>

            {/* Input Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase">Image URL</label>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => updateSlide(index, "url", e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase">Redirect Link</label>
                <input
                  type="text"
                  value={item.link}
                  onChange={(e) => updateSlide(index, "link", e.target.value)}
                  placeholder="/products"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeSlide(index)}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSlide}
        className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 hover:text-yellow-500 hover:border-yellow-500/50 transition-all font-bold text-xs uppercase tracking-widest"
      >
        <Plus className="inline-block mr-2 w-4 h-4" /> Add New Carousel Slide
      </button>

      {/* Transmits the array as a JSON string to the Server Action */}
      <input type="hidden" name="carouselItems" value={JSON.stringify(items)} />
    </div>
  );
}