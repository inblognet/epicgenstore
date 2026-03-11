// app/(admin)/admin/products/new/new-product-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, FolderTree } from "lucide-react";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { MainImageUploader } from "@/components/admin/main-image-uploader";
import { useAdminLoader } from "@/components/admin/admin-loading-provider";

interface NewProductFormProps {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  createProductAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function NewProductForm({ categories, tags, createProductAction }: NewProductFormProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useAdminLoader();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startLoading("Saving New Product...");

    try {
      const result = await createProductAction(formData);

      if (result.success) {
        router.push("/admin/products");
      } else {
        alert(result.error || "Failed to save product.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      stopLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Name *</label>
          <input type="text" id="name" name="name" required className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50" placeholder="e.g. Mechanical Keyboard" />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-xs font-black text-zinc-400 uppercase tracking-widest">URL Slug *</label>
          <input type="text" id="slug" name="slug" required className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50" placeholder="e.g. mechanical-keyboard" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-yellow-500" /> Select Categories
          </label>
          <div className="flex flex-wrap gap-4 p-5 bg-[#0a0a0a] border border-zinc-800 rounded-xl max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer w-full sm:w-[calc(50%-1rem)]">
                <input type="checkbox" name="categoryIds" value={cat.id} className="w-4 h-4 accent-yellow-500 rounded border-zinc-800 bg-zinc-900" />
                <span className="text-sm font-medium text-zinc-300">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Tags</label>
          <div className="flex flex-wrap gap-4 p-5 bg-[#0a0a0a] border border-zinc-800 rounded-xl">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="tagIds" value={tag.id} className="w-4 h-4 accent-yellow-500 rounded border-zinc-800 bg-zinc-900" />
                <span className="text-sm font-medium text-zinc-300">{tag.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="price" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Price (LKR) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">Rs.</span>
              <input type="number" id="price" name="price" step="0.01" min="0" required className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] pl-10 pr-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Inventory Stock *</label>
            <input type="number" id="stock" name="stock" min="0" required className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50" placeholder="100" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 space-y-6">
        <h2 className="text-lg font-bold text-yellow-500">Media & Content</h2>
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Main Thumbnail</label>
          <MainImageUploader />
        </div>
        <ProductImageManager />
        <div className="space-y-2">
          <label htmlFor="description" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Description</label>
          <textarea id="description" name="description" rows={5} className="flex w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50"></textarea>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Button type="submit" className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm uppercase tracking-widest rounded-xl">
          <Save className="mr-2 h-5 w-5" /> Save Product
        </Button>
      </div>
    </form>
  );
}