// components/footer.tsx
import Link from "next/link";
import {
  MapPin, Phone, Mail, Clock, Facebook,
  Instagram, Twitter, CreditCard, Building
} from "lucide-react";

interface FooterProps {
  settings: {
    footerAboutText: string;
    contactAddress: string;
    contactPhone: string;
    contactEmail: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    storeName?: string;
  };
}

export function Footer({ settings }: FooterProps) {
  // Logic to split the store name for the two-tone logo effect
  const storeName = settings.storeName || "EPIC STORE";
  const nameParts = storeName.trim().split(" ");
  const firstWord = nameParts[0];
  const restOfName = nameParts.slice(1).join(" ");

  return (
    <footer className="bg-surface-bg text-zinc-400 border-t border-surface-card font-sans pt-12 md:pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* FIXED: Changed to grid-cols-2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">

          {/* About Section - Spans full width on mobile so the paragraph doesn't get squished */}
          <div className="col-span-2 lg:col-span-1 space-y-4 md:space-y-6">
            <Link href="/" className="inline-block text-2xl font-black tracking-tighter text-zinc-50 hover:opacity-80 transition-opacity">
              <span className="text-brand transition-colors duration-300">{firstWord}</span>
              {restOfName && <span className="ml-1">{restOfName}</span>}
            </Link>
            <p className="text-xs md:text-sm leading-relaxed max-w-md">{settings.footerAboutText}</p>
            <div className="flex gap-3 md:gap-4 pt-2">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-card flex items-center justify-center hover:bg-brand hover:text-surface-bg transition-colors duration-300">
                  <Facebook className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-card flex items-center justify-center hover:bg-brand hover:text-surface-bg transition-colors duration-300">
                  <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-card flex items-center justify-center hover:bg-brand hover:text-surface-bg transition-colors duration-300">
                  <Twitter className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-zinc-50 font-bold text-sm md:text-lg mb-4 md:mb-6 tracking-wide">Quick Links</h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm font-medium">
              <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-brand transition-colors">All Products</Link></li>
              <li><Link href="/profile" className="hover:text-brand transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-brand transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="col-span-1">
            <h3 className="text-zinc-50 font-bold text-sm md:text-lg mb-4 md:mb-6 tracking-wide">Support</h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm font-medium">
              <li><Link href="/OurPolicy/TermsAndConditions" className="hover:text-brand transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/OurPolicy/PrivacyPolicy" className="hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li><Link href="/OurPolicy/RefundPolicy" className="hover:text-brand transition-colors">Refund Policy</Link></li>
              <li><Link href="/warranty" className="hover:text-brand transition-colors">Warranty Info</Link></li>
            </ul>
          </div>

          {/* Contact Section - Spans full width on mobile to fit the text */}
          <div className="col-span-2 lg:col-span-1 mt-4 md:mt-0">
            <h3 className="text-zinc-50 font-bold text-sm md:text-lg mb-4 md:mb-6 tracking-wide">Contact Details</h3>
            <ul className="space-y-3 md:space-y-4 text-xs md:text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-brand flex-shrink-0 mt-0.5 transition-colors duration-300" />
                <span>{settings.contactAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-brand flex-shrink-0 transition-colors duration-300" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-brand flex-shrink-0 transition-colors duration-300" />
                <span className="break-all">{settings.contactEmail}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand flex-shrink-0 mt-0.5 transition-colors duration-300" />
                <span>Mon-Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Bar */}
        <div className="border-y border-surface-card py-6 md:py-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 transition-colors duration-300">
          <span className="text-[10px] md:text-sm font-bold text-zinc-300 uppercase tracking-widest">We Accept</span>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 bg-surface-card border border-zinc-800/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors duration-300">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
              <span className="text-[10px] md:text-xs font-bold text-zinc-300">Credit / Debit Cards</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-card border border-zinc-800/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors duration-300">
              <Building className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
              <span className="text-[10px] md:text-xs font-bold text-zinc-300">Bank Transfer</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] md:text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}