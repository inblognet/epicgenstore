// app/(admin)/admin/customer-experiences/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { getExperienceImages, addExperienceImage, deleteExperienceImage } from "@/app/actions/customer-experience";

interface ExperienceImage {
  id: string;
  url: string;
  altText: string | null;
  order: number;
}

export default function AdminCustomerExperiencesPage() {
  const [images, setImages] = useState<ExperienceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New State for URL Input
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  useEffect(() => {
    async function fetchData() {
      const data = await getExperienceImages();
      setImages(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      alert("Please enter an image URL.");
      return;
    }

    setIsAdding(true);
    try {
      await addExperienceImage(newImageUrl, newImageAlt);

      const updatedData = await getExperienceImages();
      setImages(updatedData);

      // Clear inputs after success
      setNewImageUrl("");
      setNewImageAlt("");
      alert("Customer image added successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add image.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer photo?")) return;
    await deleteExperienceImage(id);
    const updatedData = await getExperienceImages();
    setImages(updatedData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans pb-24 transition-colors duration-300">
      <AdminNav />

      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="h-8 w-8 text-brand transition-colors duration-300" />
        <h1 className="text-3xl font-black uppercase tracking-tight italic">Manage Customer Experiences</h1>
      </div>

      {/* URL Input Area (No file uploading required!) */}
      <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 mb-8 relative overflow-hidden transition-colors duration-300">
        <h2 className="text-white text-lg font-bold mb-6">Add New Customer Image URL</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Image URL *</label>
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="e.g., https://i.imgur.com/example.jpg"
              className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white focus:border-brand outline-none transition-colors duration-300"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Alt Text (Optional)</label>
            <input
              type="text"
              value={newImageAlt}
              onChange={(e) => setNewImageAlt(e.target.value)}
              placeholder="e.g., Happy customer with custom PC"
              className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white focus:border-brand outline-none transition-colors duration-300"
            />
          </div>
        </div>

        <button
          onClick={handleAddImage}
          disabled={isAdding || !newImageUrl.trim()}
          className="bg-brand hover:bg-brand-hover text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 w-full md:w-auto justify-center shadow-lg shadow-brand/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> {isAdding ? "Adding..." : "Add Image to Carousel"}
        </button>
      </div>

      {/* Image Gallery */}
      <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 transition-colors duration-300">
        <h2 className="text-white text-lg font-bold mb-6">Current Carousel Images ({images.length})</h2>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-600">Loading experiences...</div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center text-zinc-600 bg-surface-bg rounded-2xl border border-zinc-800/50 font-bold uppercase tracking-widest text-xs flex flex-col items-center gap-4 transition-colors duration-300">
            <ImageIcon className="h-8 w-8" />
            No customer images posted yet. Paste a URL above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img) => (
              <div key={img.id} className="bg-surface-bg border border-zinc-800/50 rounded-2xl p-2 relative group overflow-hidden shadow-xl aspect-[3/4] flex items-center justify-center transition-colors duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.altText || "Customer"} className="object-cover w-full h-full rounded-xl transition-transform group-hover:scale-105 duration-500" />
                <button onClick={() => handleDelete(img.id)} className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}