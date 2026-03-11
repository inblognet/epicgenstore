// app/(admin)/admin/categories/category-form.tsx
"use client";

import { useAdminLoader } from "@/components/admin/admin-loading-provider";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Save, X } from "lucide-react";
import Link from "next/link";
import { Category } from "@prisma/client";

interface CategoryFormProps {
  editingCategory: Category | null;
  topLevelCategories: Category[];
  createCategoryAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  updateCategoryAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function CategoryForm({
  editingCategory,
  topLevelCategories,
  createCategoryAction,
  updateCategoryAction
}: CategoryFormProps) {

  const { startLoading, stopLoading } = useAdminLoader();

  // Our custom handler that wraps the Server Actions
  const handleSubmit = async (formData: FormData) => {
    if (editingCategory) {
      startLoading("Updating Category...");
      try {
        const result = await updateCategoryAction(formData);
        if (!result.success) alert(result.error);
      } catch (error) {
        alert("An error occurred.");
      } finally {
        stopLoading();
      }
    } else {
      startLoading("Creating Category...");
      try {
        const result = await createCategoryAction(formData);
        if (!result.success) alert(result.error);
        // We let the Server Action handle the revalidation/clearing form
      } catch (error) {
        alert("An error occurred.");
      } finally {
        stopLoading();
      }
    }
  };

  return (
    <div className={`bg-surface-card border transition-all duration-300 ${editingCategory ? 'border-brand shadow-lg shadow-brand/10' : 'border-zinc-800/50'} rounded-xl p-6 sticky top-24`}>
      <h2 className="text-xl font-bold mb-6 text-brand flex items-center gap-2 transition-colors duration-300">
        {editingCategory ? <Edit className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
        {editingCategory ? "Edit Category" : "Add New Category"}
      </h2>

      {/* Note: We use our custom handleSubmit instead of the raw action */}
      <form action={handleSubmit} className="space-y-4">
        {editingCategory && <input type="hidden" name="id" value={editingCategory.id} />}

        <div className="space-y-2">
          <label htmlFor="parentId" className="text-sm font-medium text-zinc-300">Parent Category</label>
          <select
            id="parentId"
            name="parentId"
            defaultValue={editingCategory?.parentId || ""}
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300"
          >
            <option value="" className="text-zinc-500">None (Make Top-Level)</option>
            {topLevelCategories
              .filter(c => c.id !== editingCategory?.id)
              .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">Name *</label>
          <input type="text" id="name" name="name" required defaultValue={editingCategory?.name || ""} placeholder="e.g. Gaming Laptops" className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300" />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium text-zinc-300">URL Slug *</label>
          <input type="text" id="slug" name="slug" required defaultValue={editingCategory?.slug || ""} placeholder="e.g. gaming-laptops" className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300" />
        </div>

        <div className="space-y-2">
          <label htmlFor="imageUrl" className="text-sm font-medium text-zinc-300">Image URL (Optional)</label>
          <input type="text" id="imageUrl" name="imageUrl" defaultValue={editingCategory?.imageUrl || ""} placeholder="https://example.com/image.jpg" className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300" />
          <p className="text-[10px] text-zinc-500">Required if you want this category to show on the Home Page carousel.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-zinc-300">Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={editingCategory?.description || ""} placeholder="Optional brief description..." className="flex w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300"></textarea>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-black font-bold transition-all duration-300 active:scale-95 shadow-md shadow-brand/10">
            {editingCategory ? <><Save className="mr-2 h-4 w-4" /> Save Changes</> : <><Plus className="mr-2 h-4 w-4" /> Add Category</>}
          </Button>

          {editingCategory && (
            <Button asChild variant="outline" className="w-full border-zinc-700 bg-transparent text-zinc-300 hover:text-white hover:bg-surface-bg transition-colors">
              <Link href="/admin/categories"><X className="mr-2 h-4 w-4" /> Cancel Edit</Link>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}