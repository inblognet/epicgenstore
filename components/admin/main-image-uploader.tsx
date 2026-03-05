// components/admin/main-image-uploader.tsx
"use client";

import { useState } from "react";
import { X, Link as LinkIcon, UploadCloud } from "lucide-react";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// FIXED: Added `initialUrl` prop so the Edit Product page can load existing images
export function MainImageUploader({ initialUrl = "" }: { initialUrl?: string }) {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [manualUrl, setManualUrl] = useState<string>("");

  return (
    <div className="space-y-4">
      {/* This hidden input is the magic link to your Server Action */}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {/* Mode Toggles (Upload vs URL) - Only show if no image is selected yet */}
      {!imageUrl && (
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
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
      )}

      {/* Main UI Area */}
      {imageUrl ? (
        // Preview State
        <div className="relative w-full aspect-[16/9] max-h-[300px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Product Thumbnail Preview" className="max-h-full max-w-full object-contain" />
          <button
            type="button"
            onClick={() => { setImageUrl(""); setManualUrl(""); }}
            className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : mode === "upload" ? (
        // UploadThing Dropzone
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
          <UploadDropzone<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onClientUploadComplete={(res: { url: string }[] | undefined) => {
              if (res && res.length > 0) {
                setImageUrl(res[0].url); // Save URL to state
              }
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
            appearance={{
              container: "p-8",
              uploadIcon: "text-yellow-500",
              label: "text-zinc-300 hover:text-yellow-500",
              button: "bg-yellow-500 text-black font-bold uppercase tracking-widest after:bg-yellow-600",
            }}
          />
        </div>
      ) : (
        // Manual URL Input
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={() => { if (manualUrl) setImageUrl(manualUrl); }}
            className="h-12 px-6 bg-zinc-800 hover:bg-yellow-500 hover:text-black text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}