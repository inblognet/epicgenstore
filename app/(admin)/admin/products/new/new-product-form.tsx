// app/(admin)/admin/products/new/new-product-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, FolderTree } from "lucide-react";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { MainImageUploader } from "@/components/admin/main-image-uploader";
import { useAdminLoader } from "@/components/admin/admin-loading-provider";

// Define the exact shape of the data we are passing from the server page
interface NewProductFormProps {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  createProductAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function NewProductForm({ categories, tags, createProductAction }: NewProductFormProps) {
  const router = useRouter();

  // Initialize the loader
  const { startLoading, stopLoading } = useAdminLoader();

  // Our custom submit handler
  const handleSubmit = async (formData: FormData) => {
    startLoading("Saving New Product...");

    try {
      const result = await createProductAction(formData);

      if (result.success) {
        // Success! Redirect back to the products list
        router.push("/admin/products");
      } else {
        // Show an alert if there was a validation error from the server
        alert(result.error || "Failed to save product.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      stopLoading(); // ALWAYS turn off the loader
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">

      {/* Core Info */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
            placeholder="e.g. Mechanical Gaming Keyboard"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-xs font-black text-zinc-400 uppercase tracking-widest">URL Slug *</label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
            placeholder="e.g. mechanical-keyboard"
          />
        </div>

        {/* --- MULTIPLE CATEGORY SELECTOR --- */}
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-yellow-500" /> Select Categories
          </label>
          <div className="flex flex-wrap gap-4 p-5 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-inner max-h-60 overflow-y-auto">
            {categories.length === 0 ? (
              <span className="text-sm text-zinc-500 italic">No categories created yet.</span>
            ) : (
              categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group w-full sm:w-[calc(50%-1rem)]">
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={cat.id}
                    className="w-4 h-4 accent-yellow-500 cursor-pointer rounded border-zinc-800 bg-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-yellow-500 transition-colors">
                    {cat.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* PRODUCT TAGS SELECTOR */}
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Tags</label>
          <div className="flex flex-wrap gap-4 p-5 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-inner">
            {tags.length === 0 ? (
              <span className="text-sm text-zinc-500 italic">No tags created yet.</span>
            ) : (
              tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    className="w-4 h-4 accent-yellow-500 cursor-pointer rounded border-zinc-800 bg-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-yellow-500 transition-colors">
                    {tag.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="price" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Price (LKR) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">Rs.</span>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                required
                className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Inventory Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              required
              className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 space-y-6">
        <h2 className="text-lg font-bold text-yellow-500">Media & Content</h2>

        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Main Thumbnail (Upload or URL)</label>
          <MainImageUploader />
        </div>

        <ProductImageManager />

        <div className="space-y-2">
          <label htmlFor="description" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="flex w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all resize-y"
            placeholder="Detailed specs, features, and information..."
          ></textarea>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Button type="submit" className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-yellow-500/20">
          <Save className="mr-2 h-5 w-5" /> Save Product
        </Button>
      </div>
    </form>
  );
}