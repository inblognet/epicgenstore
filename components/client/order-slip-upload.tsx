// components/client/order-slip-upload.tsx
"use client";

import { useState } from "react";
import { Check, AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { updateOrderSlip } from "@/app/actions/orders"; // Your server action
import { UploadButton } from "@/lib/uploadthing"; // Your helper file

interface OrderSlipUploadProps {
  orderId: string;
  currentSlip: string | null;
}

export function OrderSlipUpload({ orderId, currentSlip }: OrderSlipUploadProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Success State UI
  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20 animate-in zoom-in-95">
        <Check className="w-3.5 h-3.5" /> Slip Uploaded Successfully
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full sm:w-64">

      {/* 2. Show status if a slip is already saved in DB */}
      {currentSlip && !isUpdating && (
        <div className="flex items-center gap-2 mb-1 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tight">
            Current slip stored in system
          </span>
        </div>
      )}

      {/* 3. The UploadThing Button */}
      <UploadButton
        endpoint="bankSlipUploader"
        onUploadBegin={() => setIsUpdating(true)}
        onClientUploadComplete={async (res) => {
          const uploadedUrl = res?.[0].url;
          if (uploadedUrl) {
            // Automatically trigger your server action once the file is in the cloud
            const result = await updateOrderSlip(orderId, uploadedUrl);
            if (result.success) {
              setSuccess(true);
            } else {
              alert("Database update failed. Please contact support.");
            }
          }
          setIsUpdating(false);
        }}
        onUploadError={(error: Error) => {
          alert(`UPLOAD ERROR: ${error.message}`);
          setIsUpdating(false);
        }}
        appearance={{
          button: {
            background: isUpdating ? "#27272a" : "#eab308", // Switch color during upload
            color: "black",
            fontSize: "10px",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            borderRadius: "0.75rem",
            width: "100%",
            height: "2.75rem",
            transition: "all 0.2s ease",
          },
          allowedContent: {
            display: "none" // Keeps the UI clean by hiding the "Image (4MB)" label
          }
        }}
        content={{
          button({ ready }) {
            if (isUpdating) return (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
              </span>
            );
            if (ready) return currentSlip ? "Replace Local Slip" : "Upload Local Slip";
            return "Initialising...";
          }
        }}
      />

      {/* 4. Help Text */}
      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-1.5 px-1">
        <AlertCircle className="w-2.5 h-2.5" /> Max size: 4MB (PNG/JPG)
      </p>
    </div>
  );
}