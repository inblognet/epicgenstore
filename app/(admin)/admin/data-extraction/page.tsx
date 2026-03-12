// app/(admin)/admin/data-extraction/page.tsx
"use client";

import { useState } from "react";
import { Download, UploadCloud, FileSpreadsheet, Database } from "lucide-react";
import { importDataAction } from "@/app/actions/data-import";

export default function DataExtractionPage() {
  const [selectedModel, setSelectedModel] = useState("product");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadTemplate = () => {
    window.location.href = `/api/admin/export-template?model=${selectedModel}`;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an Excel file first.");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await importDataAction(formData, selectedModel);

    if (result.success) {
      alert(result.message);
      setFile(null); // Clear form
    } else {
      alert(result.error);
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-6">
        <Database className="w-8 h-8 text-brand" />
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Data Extraction & Import</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">Bulk manage your database using Excel spreadsheets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* --- STEP 1: DOWNLOAD TEMPLATE --- */}
        <div className="bg-surface-card border border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-lg">
          <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center mb-6">
            <Download className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">1. Download Template</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Select the data model you want to bulk import. We will generate an Excel file with the correct column headers for you to fill out.
          </p>

          <div className="space-y-4">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-surface-bg border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-brand outline-none"
            >
              <option value="product">Products Data</option>
              <option value="category">Categories Data</option>
              <option value="tag">Tags Data</option>
              <option value="voucher">Vouchers Data</option>
            </select>

            <button
              onClick={handleDownloadTemplate}
              className="w-full bg-surface-bg border border-zinc-700 hover:border-brand text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-500" />
              Download .XLSX Template
            </button>
          </div>
        </div>

        {/* --- STEP 2: UPLOAD DATA --- */}
        <form onSubmit={handleUpload} className="bg-surface-card border border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">2. Upload Completed Data</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            {/* 🚀 FIXED: Replaced "haven't" with "haven&apos;t" */}
            Upload your filled-out Excel file. Ensure the columns haven&apos;t been renamed. The system will create new records and update existing ones (based on Slug/Code).
          </p>

          <div className="flex-1 flex flex-col justify-center">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-zinc-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-xs file:font-bold file:uppercase file:tracking-widest
                file:bg-brand file:text-black
                hover:file:bg-brand-hover cursor-pointer border border-zinc-800 border-dashed rounded-xl p-4 bg-surface-bg/50 mb-6"
            />

            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full bg-brand hover:bg-brand-hover text-black font-black py-3.5 rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
            >
              {isUploading ? "Processing Import..." : "Import Data to Database"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}