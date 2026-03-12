// app/(admin)/admin/products/new/new-product-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, FolderTree, Plus, Trash2, AlignLeft, TableProperties } from "lucide-react";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { MainImageUploader } from "@/components/admin/main-image-uploader";
import { useAdminLoader } from "@/components/admin/admin-loading-provider";
import { useState } from "react"; // 🚀 Added useState

interface NewProductFormProps {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  createProductAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function NewProductForm({ categories, tags, createProductAction }: NewProductFormProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useAdminLoader();

  // 🚀 STATE FOR DESCRIPTION MODES
  const [descMode, setDescMode] = useState<'text' | 'table'>('text');
  const [textDesc, setTextDesc] = useState('');
  const [tableRows, setTableRows] = useState([{ key: 'Model', value: '' }]);

  // 🚀 TABLE ROW HANDLERS
  const addRow = () => setTableRows([...tableRows, { key: '', value: '' }]);
  const removeRow = (index: number) => setTableRows(tableRows.filter((_, i) => i !== index));
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
      // Filter out completely empty rows so we don't save blank spaces
      const validRows = tableRows.filter(r => r.key.trim() !== '' || r.value.trim() !== '');
      const formattedData = validRows.map(r => [r.key, r.value]);
      descriptionPayload = { type: 'table', data: formattedData };
    } else {
      descriptionPayload = textDesc;
    }

    // Append the packaged JSON string to FormData
    formData.set("description", JSON.stringify(descriptionPayload));

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
              className="flex w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 placeholder:text-zinc-700"
              placeholder="Write a detailed product description..."
            />
          )}

          {/* Table Mode UI */}
          {descMode === 'table' && (
            <div className="p-5 border border-zinc-800 bg-[#0a0a0a] rounded-xl space-y-3">
              <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                <span className="col-span-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Specification Label</span>
                <span className="col-span-7 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Details / Value</span>
              </div>

              {tableRows.map((row, index) => (
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
        <Button type="submit" className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm uppercase tracking-widest rounded-xl">
          <Save className="mr-2 h-5 w-5" /> Save Product
        </Button>
      </div>
    </form>
  );
}