// app\(admin)\admin\categories\CategoryForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";

export function CategoryForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // NEW STATE
  const [parentId, setParentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Assuming a server-side action to handle the category creation
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, slug, imageUrl, parentId }),
      });

      if (response.ok) {
        // Reset form and refresh list
        setName("");
        setSlug("");
        setImageUrl("");
        setParentId("");
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Failed to create category:", errorData.error);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-card border border-theme-border rounded-3xl p-6 shadow-xl flex flex-col gap-5 sticky top-8">
      <h2 className="text-xl font-bold">Create New Category</h2>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Category Name</label>
        <input name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gaming Mouse" className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 focus:border-brand outline-none" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">URL Slug (e.g. gaming-mouse)</label>
        <input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. gaming-mouse" className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 focus:border-brand outline-none" />
      </div>

      {/* --- NEW IMAGE URL INPUT --- */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Image URL (Optional)</label>
        <input name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="e.g. https://images.unsplash.com/mouse.jpg" className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 focus:border-brand outline-none" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Parent Category (Optional)</label>
        <select name="parentId" value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 focus:border-brand outline-none cursor-pointer">
          <option value="">Select a Parent Category...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isLoading} className="h-12 mt-2 bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? "Creating..." : "Add Category"}
      </button>
    </form>
  );
}