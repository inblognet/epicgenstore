// components/admin/product-image-manager.tsx
"use client";

import { useState } from "react";
import { X, Plus, UploadCloud, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function ProductImageManager({ initialImages = [] }: { initialImages?: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [currentInput, setCurrentInput] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");

  const addImageUrl = () => {
    if (currentInput.trim() !== "") {
      setImages([...images, currentInput.trim()]);
      setCurrentInput("");
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Hidden input to pass data to Server Action */}
      <input type="hidden" name="subImages" value={JSON.stringify(images)} />

      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-2">
        Sub-Product Images (Gallery)
      </label>

      {/* 1. Gallery Preview Area */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl mb-4">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. Add New Image Section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">

        {/* Mode Toggles */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-fit mb-4">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
              mode === "upload" ? "bg-zinc-800 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
              mode === "url" ? "bg-zinc-800 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <LinkIcon className="w-4 h-4" /> URL
          </button>
        </div>

        {/* Upload or URL Input Area */}
        {mode === "upload" ? (
          <div className="border border-zinc-800 border-dashed rounded-xl bg-zinc-900/50 overflow-hidden">
            <UploadDropzone<OurFileRouter, "imageUploader">
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                  // Append all newly uploaded URLs to the existing gallery array
                  const newUrls = res.map((file) => file.url);
                  setImages((prev) => [...prev, ...newUrls]);
                }
              }}
              onUploadError={(error: Error) => {
                alert(`Upload Error: ${error.message}`);
              }}
              appearance={{
                container: "p-6",
                uploadIcon: "text-yellow-500 w-8 h-8",
                label: "text-zinc-400 text-sm hover:text-yellow-500",
                button: "bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest after:bg-yellow-500 hover:text-yellow-500",
              }}
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="url"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50"
                placeholder="Paste image URL here..."
              />
            </div>
            <button
              type="button"
              onClick={addImageUrl}
              disabled={!currentInput.trim()}
              className="h-11 px-4 bg-zinc-800 hover:bg-yellow-500 hover:text-black text-zinc-300 disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        )}
      </div>

    </div>
  );
}