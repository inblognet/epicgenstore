// components/admin/admin-loading-provider.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { Loader2 } from "lucide-react";

interface AdminLoadingContextType {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const AdminLoadingContext = createContext<AdminLoadingContextType | undefined>(undefined);

export function AdminLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");

  const startLoading = (message = "Processing...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return (
    <AdminLoadingContext.Provider value={{ startLoading, stopLoading }}>
      {children}

      {/* --- THE FULL SCREEN OVERLAY --- */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-surface-card border border-theme-border shadow-2xl rounded-2xl p-8 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
            <h3 className="text-theme-main font-black tracking-widest uppercase text-sm">
              {loadingMessage}
            </h3>
            <p className="text-theme-muted text-xs font-medium">Please do not close this page.</p>
          </div>
        </div>
      )}
    </AdminLoadingContext.Provider>
  );
}

// Custom hook to use the loader anywhere
export function useAdminLoader() {
  const context = useContext(AdminLoadingContext);
  if (!context) {
    throw new Error("useAdminLoader must be used within an AdminLoadingProvider");
  }
  return context;
}