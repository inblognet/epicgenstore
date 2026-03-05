// components/client/mobile-menu-button.tsx
"use client";

import { useState } from "react";
import { Menu, X, ChevronRight, Home, Package, Truck, Info, PhoneCall, Wrench, Landmark, Shield, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image"; // NEW: For user profile image

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-300 hover:text-brand transition-colors duration-300"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Slide-out Mobile Menu */}
      <div className={`fixed inset-0 z-[110] ${isOpen ? "visible" : "invisible"}`}>
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Panel */}
        <div className={`absolute top-0 left-0 w-[280px] h-full bg-surface-card border-r border-zinc-800/50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-surface-bg/50 transition-colors duration-300 shrink-0">
            <span className="text-lg font-black tracking-tighter text-white">
              <span className="text-brand transition-colors duration-300">ALL</span> MENUS
            </span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors duration-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-2 overflow-y-auto flex-grow">

            {/* --- NEW: USER PROFILE SECTION --- */}
            {session?.user ? (
              <div className="mb-4 pb-4 border-b border-zinc-800/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-bg border border-brand/50 flex items-center justify-center overflow-hidden shrink-0">
                  {session.user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-brand" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
                    Hi, {session.user.name?.split(' ')[0] || 'There'}!
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">
                    {session.user.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-4 pb-4 border-b border-zinc-800/50">
                <MobileNavLink href="/login" icon={<User className="w-4 h-4"/>} label="Login / Register" onClick={() => setIsOpen(false)} />
              </div>
            )}
            <MobileNavLink href="/profile" icon={<User className="w-4 h-4"/>} label="My Profile" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/" icon={<Home className="w-4 h-4"/>} label="Home" onClick={() => setIsOpen(false)} />

            <MobileNavLink href="/products?category=all" icon={<Package className="w-4 h-4"/>} label="All Products" onClick={() => setIsOpen(false)} />

            {session?.user?.role === "ADMIN" && (
              <div className="mb-2 pb-2 border-b border-zinc-800/50">
                <MobileNavLink href="/admin" icon={<Shield className="w-4 h-4"/>} label="Admin Dashboard" onClick={() => setIsOpen(false)} />
              </div>
            )}

            <MobileNavLink href="/service-center" icon={<Wrench className="w-4 h-4"/>} label="Service Center" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/bank-details" icon={<Landmark className="w-4 h-4"/>} label="Bank Details" onClick={() => setIsOpen(false)} />

            <MobileNavLink href="/profile" icon={<Truck className="w-4 h-4"/>} label="Track Order" onClick={() => setIsOpen(false)} />

            <MobileNavLink href="/about" icon={<Info className="w-4 h-4"/>} label="About Us" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/contact" icon={<PhoneCall className="w-4 h-4"/>} label="Contact Us" onClick={() => setIsOpen(false)} />

            <div className="mt-6 pt-6 border-t border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-4 mb-4">Follow Us</p>
              <div className="flex gap-6 px-4">
                <FacebookIcon className="w-5 h-5 text-zinc-400 hover:text-brand transition-colors duration-300 cursor-pointer" />
                <YoutubeIcon className="w-5 h-5 text-zinc-400 hover:text-brand transition-colors duration-300 cursor-pointer" />
              </div>
            </div>
          </nav>

          {/* --- NEW: LOGOUT SECTION --- */}
          {session?.user && (
            <div className="p-4 border-t border-zinc-800/50 shrink-0 bg-surface-card mt-auto">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-sm transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                SIGN OUT
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl bg-surface-bg/30 border border-transparent hover:border-brand/30 hover:bg-surface-bg transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 text-zinc-300 group-hover:text-white transition-colors duration-300">
        <span className="text-brand transition-colors duration-300">{icon}</span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-brand transition-colors duration-300" />
    </Link>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}