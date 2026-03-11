// app/(admin)/admin/products/[id]/edit/edit-product-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, FolderTree } from "lucide-react";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { MainImageUploader } from "@/components/admin/main-image-uploader";
import { useAdminLoader } from "@/components/admin/admin-loading-provider";
import { Product, Category, Tag } from "@prisma/client";

// Use the exact Prisma types for perfect type safety
interface EditProductFormProps {
  product: Product & {
    categories: Category[];
    tags: Tag[];
  };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  updateProductAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function EditProductForm({ product, categories, tags, updateProductAction }: EditProductFormProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useAdminLoader();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Grab the data from the HTML form
    const formData = new FormData(e.currentTarget);

    startLoading("Updating Product...");

    try {
      const result = await updateProductAction(formData);

      if (result.success) {
        router.push("/admin/products");
      } else {
        alert(result.error || "Failed to update product.");
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
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={product.name}
            required
            className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-xs font-black text-zinc-400 uppercase tracking-widest">URL Slug *</label>
          <input
            type="text"
            id="slug"
            name="slug"
            defaultValue={product.slug}
            required
            className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
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
                    // Since product.categories is strictly typed now, 'c' is automatically inferred!
                    defaultChecked={product.categories.some(c => c.id === cat.id)}
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
                    // 't' is automatically inferred as Tag!
                    defaultChecked={product.tags.some(t => t.id === tag.id)}
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
                defaultValue={Number(product.price)}
                step="0.01"
                min="0"
                required
                className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Inventory Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              defaultValue={product.stock}
              min="0"
              required
              className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 space-y-6">
        <h2 className="text-lg font-bold text-yellow-500">Media & Content</h2>

        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Main Thumbnail (Upload or URL)</label>
          <MainImageUploader initialUrl={product.imageUrl || ""} />
        </div>

        <ProductImageManager initialImages={product.images} />

        <div className="space-y-2">
          <label htmlFor="description" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Description</label>
          <textarea
            id="description"
            name="description"
            defaultValue={product.description || ""}
            rows={5}
            className="flex w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all resize-y"
            placeholder="Detailed specs and information..."
          ></textarea>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Button type="submit" className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-black text-sm uppercase tracking-widest rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-4">
          <Save className="mr-2 h-5 w-5" /> Update Product
        </Button>
      </div>
    </form>
  );
}