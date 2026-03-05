// components/admin/admin-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText, Settings, LayoutTemplate, Landmark, Info, Phone, Inbox, Shield, RefreshCcw, FileSignature, Palette } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPagesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Inbox", path: "/admin/inbox" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Products", path: "/admin/products" },
    { name: "Categories", path: "/admin/categories" },
    // --- NEW: Added Tags link ---
    { name: "Tags", path: "/admin/tags" },
    { name: "Vouchers", path: "/admin/vouchers" },
    { name: "Experiences", path: "/admin/customer-experiences" },
    { name: "Carousels", path: "/admin/carousels" },
  ];

  const isSettingsActive = pathname === "/admin/settings";
  const isAppearanceActive = pathname === "/admin/settings/appearance";
  const isPagesActive = pathname.includes("/admin/settings/sitepages");

  return (
    <div className="flex gap-6 mb-8 border-b border-theme-border pb-4 overflow-visible relative transition-colors duration-300 scrollbar-hide overflow-x-auto">
      {navLinks.map((link) => {
        const isActive = pathname === link.path;
        return (
          <Link
            key={link.name}
            href={link.path}
            className={`font-medium transition-colors whitespace-nowrap uppercase text-xs tracking-widest ${
              isActive
                ? "text-brand font-bold border-b-2 border-brand pb-4 -mb-[18px]"
                : "text-theme-muted hover:text-brand"
            }`}
          >
            {link.name}
          </Link>
        );
      })}

      {/* Standard Site Settings Link */}
      <Link
        href="/admin/settings"
        className={`font-medium transition-colors whitespace-nowrap uppercase text-xs tracking-widest flex items-center gap-1 ${
          isSettingsActive
            ? "text-brand font-bold border-b-2 border-brand pb-4 -mb-[18px]"
            : "text-theme-muted hover:text-brand"
        }`}
      >
        <Settings className="w-3.5 h-3.5" /> Core Settings
      </Link>

      {/* NEW: Appearance Link */}
      <Link
        href="/admin/settings/appearance"
        className={`font-medium transition-colors whitespace-nowrap uppercase text-xs tracking-widest flex items-center gap-1 ${
          isAppearanceActive
            ? "text-brand font-bold border-b-2 border-brand pb-4 -mb-[18px]"
            : "text-theme-muted hover:text-brand"
        }`}
      >
        <Palette className="w-3.5 h-3.5" /> Appearance
      </Link>

      {/* Pages Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsPagesOpen(!isPagesOpen)}
          className={`font-medium transition-colors whitespace-nowrap uppercase text-xs tracking-widest flex items-center gap-1 ${
            isPagesActive
              ? "text-brand font-bold border-b-2 border-brand pb-4 -mb-[18px]"
              : "text-theme-muted hover:text-brand"
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" /> Pages <ChevronDown className={`w-3 h-3 transition-transform ${isPagesOpen ? "rotate-180" : ""}`} />
        </button>

        {isPagesOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-surface-card border border-theme-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 transition-colors duration-300">
            <Link
              href="/admin/settings/sitepages/servicescenter"
              onClick={() => setIsPagesOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-theme-main hover:bg-surface-bg hover:text-brand transition-colors"
            >
              <FileText className="w-4 h-4" /> Service Center
            </Link>

            <Link
              href="/admin/settings/sitepages/bankdetails"
              onClick={() => setIsPagesOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-theme-main hover:bg-surface-bg hover:text-brand transition-colors"
            >
              <Landmark className="w-4 h-4" /> Bank Details
            </Link>

            <Link
              href="/admin/settings/sitepages/about"
              onClick={() => setIsPagesOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-theme-main hover:bg-surface-bg hover:text-brand transition-colors"
            >
              <Info className="w-4 h-4" /> About Us
            </Link>

            <Link
              href="/admin/settings/sitepages/contact"
              onClick={() => setIsPagesOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-theme-main hover:bg-surface-bg hover:text-brand transition-colors"
            >
              <Phone className="w-4 h-4" /> Contact Us
            </Link>

            <Link
              href="/admin/settings/sitepages/OurPolicy/PrivacyPolicy"
              onClick={() => setIsPagesOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-theme-main hover:bg-surface-bg hover:text-brand transition-colors border-t border-theme-border mt-1 pt-3"
            >
              <Shield className="w-4 h-4" /> Privacy Policy
            </Link>

            <Link
              href="/admin/settings/sitepages/OurPolicy/RefundPolicy"
              onClick={() => setIsPagesOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-theme-main hover:bg-surface-bg hover:text-brand transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Refund Policy
            </Link>

            <Link
              href="/admin/settings/sitepages/OurPolicy/TermsAndConditions"
              onClick={() => setIsPagesOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-theme-main hover:bg-surface-bg hover:text-brand transition-colors"
            >
              <FileSignature className="w-4 h-4" /> Terms & Conditions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}