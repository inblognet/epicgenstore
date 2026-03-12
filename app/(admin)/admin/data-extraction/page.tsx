// app/(admin)/admin/data-extraction/page.tsx
"use client";

import { useState } from "react";
import { Download, UploadCloud, FileSpreadsheet, Database, HardDriveDownload } from "lucide-react";
import { importDataAction } from "@/app/actions/data-import";

export default function DataExtractionPage() {
  const [selectedModel, setSelectedModel] = useState("product");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadTemplate = () => {
    window.location.href = `/api/admin/export-template?model=${selectedModel}`;
  };

  const handleDownloadBackup = () => {
    window.location.href = `/api/admin/export-data?model=${selectedModel}`;
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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-6">
        <Database className="w-8 h-8 text-brand" />
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Data Management</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">Backup your database, edit in Excel, and restore or import new records.</p>
        </div>
      </div>

      {/* Global Model Selector */}
      <div className="bg-surface-card border border-zinc-800/50 p-6 rounded-3xl shadow-lg flex items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Target Data Model</h2>
          <p className="text-xs text-zinc-500">Select which database table you want to interact with below.</p>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-64 bg-surface-bg border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold tracking-wider uppercase focus:border-brand outline-none transition-colors"
        >
          <option value="product">📦 Products Data</option>
          <option value="category">📁 Categories Data</option>
          <option value="tag">🏷️ Tags Data</option>
          <option value="voucher">🎟️ Vouchers Data</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* --- STEP 1: DOWNLOAD EMPTY TEMPLATE --- */}
        <div className="bg-surface-card border border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6">
            <Download className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Empty Template</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Download a clean, empty Excel file with the correct column headers. Perfect for manually adding a batch of brand-new items.
          </p>

          <button
            onClick={handleDownloadTemplate}
            className="w-full bg-surface-bg border border-zinc-700 hover:border-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            Download Blank .XLSX
          </button>
        </div>

        {/* --- STEP 2: DOWNLOAD FULL BACKUP --- */}
        <div className="bg-surface-card border border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand/20 text-brand text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">Recommended</div>
          <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center mb-6">
            <HardDriveDownload className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Full Data Backup</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Export all existing records from your live database. You can keep this as a safe backup, or edit the prices/stock directly in Excel and re-upload it!
          </p>

          <button
            onClick={handleDownloadBackup}
            className="w-full bg-surface-bg border border-brand/50 hover:bg-brand hover:text-black text-brand font-black py-3 rounded-xl text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-auto shadow-lg shadow-brand/10"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Live Data
          </button>
        </div>

        {/* --- STEP 3: UPLOAD DATA --- */}
        <form onSubmit={handleUpload} className="bg-surface-card border border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-6">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Upload & Sync</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Upload your filled-out template or edited backup file. The system will safely update existing records and create any new ones it finds.
          </p>

          <div className="flex-1 flex flex-col justify-end">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-zinc-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-xs file:font-bold file:uppercase file:tracking-widest
                file:bg-zinc-800 file:text-white
                hover:file:bg-zinc-700 cursor-pointer border border-zinc-800 border-dashed rounded-xl p-3 bg-surface-bg/50 mb-4"
            />

            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-3 rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
            >
              {isUploading ? "Processing..." : "Run Import Sync"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}