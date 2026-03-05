// components/footer.tsx
import Link from "next/link";
import {
  MapPin, Phone, Mail, Clock, Facebook,
  Instagram, Twitter, CreditCard, Building
} from "lucide-react";

// --- UPDATED: Interface to match settings fetched in layout.tsx ---
interface FooterProps {
  settings: {
    footerAboutText: string;
    contactAddress: string;
    contactPhone: string;
    contactEmail: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    storeName?: string; // ADDED: storeName
  };
}

export function Footer({ settings }: FooterProps) {
  // Logic to split the store name for the two-tone logo effect
  const storeName = settings.storeName || "EPIC STORE";
  const nameParts = storeName.trim().split(" ");
  const firstWord = nameParts[0];
  const restOfName = nameParts.slice(1).join(" ");

  return (
    // REPLACED: bg-zinc-950 -> bg-surface-bg, border-zinc-900 -> border-surface-card
    <footer className="bg-surface-bg text-zinc-400 border-t border-surface-card font-sans pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* About Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block text-2xl font-black tracking-tighter text-zinc-50 hover:opacity-80 transition-opacity">
              {/* REPLACED: text-yellow-500 -> text-brand and made text dynamic */}
              <span className="text-brand transition-colors duration-300">{firstWord}</span>
              {restOfName && <span className="ml-1">{restOfName}</span>}
            </Link>
            <p className="text-sm leading-relaxed">{settings.footerAboutText}</p>
            <div className="flex gap-4 pt-2">
              {settings.facebookUrl && (
                // REPLACED: bg-zinc-900 -> bg-surface-card, hover:bg-yellow-500 -> hover:bg-brand, hover:text-zinc-950 -> hover:text-surface-bg
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center hover:bg-brand hover:text-surface-bg transition-colors duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center hover:bg-brand hover:text-surface-bg transition-colors duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center hover:bg-brand hover:text-surface-bg transition-colors duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-zinc-50 font-bold text-lg mb-6 tracking-wide">Quick Links</h3>
            <ul className="space-y-3 text-sm font-medium">
              {/* REPLACED: hover:text-yellow-500 -> hover:text-brand */}
              <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-brand transition-colors">All Products</Link></li>
              <li><Link href="/profile" className="hover:text-brand transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-brand transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-zinc-50 font-bold text-lg mb-6 tracking-wide">Support</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/OurPolicy/TermsAndConditions" className="hover:text-brand transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/OurPolicy/PrivacyPolicy" className="hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li><Link href="/OurPolicy/RefundPolicy" className="hover:text-brand transition-colors">Refund Policy</Link></li>
              <li><Link href="/warranty" className="hover:text-brand transition-colors">Warranty Info</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-zinc-50 font-bold text-lg mb-6 tracking-wide">Contact Details</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                {/* REPLACED: text-yellow-500 -> text-brand */}
                <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5 transition-colors duration-300" />
                <span>{settings.contactAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand flex-shrink-0 transition-colors duration-300" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand flex-shrink-0 transition-colors duration-300" />
                <span>{settings.contactEmail}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand flex-shrink-0 mt-0.5 transition-colors duration-300" />
                <span>Mon-Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Bar */}
        {/* REPLACED: border-zinc-900 -> border-surface-card */}
        <div className="border-y border-surface-card py-8 mb-8 flex flex-col md:flex-row items-center justify-center gap-6 transition-colors duration-300">
          <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">We Accept</span>
          <div className="flex flex-wrap justify-center gap-4">
            {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-surface-card */}
            <div className="flex items-center gap-2 bg-surface-card border border-zinc-800/50 px-4 py-2 rounded-lg transition-colors duration-300">
              <CreditCard className="w-5 h-5 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300">Credit / Debit Cards</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-card border border-zinc-800/50 px-4 py-2 rounded-lg transition-colors duration-300">
              <Building className="w-5 h-5 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300">Bank Transfer</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-medium">
          {/* REPLACED hardcoded name with dynamic storeName */}
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}