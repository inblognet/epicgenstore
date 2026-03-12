// app/(admin)/admin/products/[id]/edit/edit-product-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, FolderTree, Plus, Trash2, AlignLeft, TableProperties } from "lucide-react";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { MainImageUploader } from "@/components/admin/main-image-uploader";
import { useAdminLoader } from "@/components/admin/admin-loading-provider";
import { Product, Category, Tag } from "@prisma/client";
import { useState } from "react";

// 🚀 FIXED: Added strict types to replace `any`
type TableRow = { key: string; value: string };
type TableDescriptionData = { type?: string; data?: string[][] };

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

  // 🚀 INITIALIZE DESCRIPTION STATE SAFELY (Strictly Typed)
  const descData = product.description as TableDescriptionData | string | null;
  const isTableData = descData !== null && typeof descData === 'object' && descData.type === 'table';

  const [descMode, setDescMode] = useState<'text' | 'table'>(isTableData ? 'table' : 'text');

  const [textDesc, setTextDesc] = useState<string>(
    !isTableData ? (typeof descData === 'string' ? descData : descData ? JSON.stringify(descData) : '') : ''
  );

  const initialTableRows: TableRow[] = isTableData && Array.isArray(descData.data) && descData.data.length > 0
    ? descData.data.map((row: string[]) => ({ key: row[0] || '', value: row[1] || '' }))
    : [{ key: 'Model', value: '' }];

  const [tableRows, setTableRows] = useState<TableRow[]>(initialTableRows);

  // 🚀 TABLE ROW HANDLERS (Strictly Typed Parameters)
  const addRow = () => setTableRows([...tableRows, { key: '', value: '' }]);
  const removeRow = (index: number) => setTableRows(tableRows.filter((_: TableRow, i: number) => i !== index));
  const updateRow = (index: number, field: 'key' | 'value', val: string) => {
    const newRows = [...tableRows];
    newRows[index][field] = val;
    setTableRows(newRows);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // 🚀 PACKAGE DESCRIPTION INTO JSON
    let descriptionPayload;
    if (descMode === 'table') {
      const validRows = tableRows.filter((r: TableRow) => r.key.trim() !== '' || r.value.trim() !== '');
      const formattedData = validRows.map((r: TableRow) => [r.key, r.value]);
      descriptionPayload = { type: 'table', data: formattedData };
    } else {
      descriptionPayload = textDesc;
    }

    formData.set("description", JSON.stringify(descriptionPayload));

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

        {/* 🚀 NEW DYNAMIC DESCRIPTION SECTION */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Description</label>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#0a0a0a] rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setDescMode('text')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${descMode === 'text' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <AlignLeft className="w-3.5 h-3.5" /> Text Mode
              </button>
              <button
                type="button"
                onClick={() => setDescMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${descMode === 'table' ? 'bg-yellow-500 text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <TableProperties className="w-3.5 h-3.5" /> Table Mode
              </button>
            </div>
          </div>

          {/* Text Mode UI */}
          {descMode === 'text' && (
            <textarea
              value={textDesc}
              onChange={(e) => setTextDesc(e.target.value)}
              rows={6}
              className="flex w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all resize-y"
              placeholder="Write a detailed product description..."
            />
          )}

          {/* Table Mode UI */}
          {descMode === 'table' && (
            <div className="p-5 border border-zinc-800 bg-[#0a0a0a] rounded-xl space-y-3 shadow-inner">
              <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                <span className="col-span-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Specification Label</span>
                <span className="col-span-7 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Details / Value</span>
              </div>

              {tableRows.map((row: TableRow, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-start group">
                  <div className="col-span-4">
                    <input
                      value={row.key}
                      onChange={(e) => updateRow(index, 'key', e.target.value)}
                      placeholder="e.g. Processor"
                      className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50"
                    />
                  </div>
                  <div className="col-span-7">
                    <input
                      value={row.value}
                      onChange={(e) => updateRow(index, 'value', e.target.value)}
                      placeholder="e.g. Intel Core i9-13900K"
                      className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-600 hover:text-red-500 hover:border-red-500/50 transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRow}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Specification Row
              </button>
            </div>
          )}
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