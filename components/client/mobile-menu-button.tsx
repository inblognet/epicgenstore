// components/client/mobile-menu-button.tsx
"use client";

import { useState } from "react";
import { Menu, X, ChevronRight, Home, Package, Truck, Info, PhoneCall, Wrench, TicketPercent, Landmark, Shield, User, LogOut, ChevronDown, Folder } from "lucide-react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";

// Define the type for Categories so it perfectly matches Prisma's output
interface ChildCategory {
  id: string | number;
  name: string;
  slug: string;
}

interface CategoryWithChildren {
  id: string | number;
  name: string;
  slug: string;
  children?: ChildCategory[];
}

export function MobileMenuButton({ categories = [] }: { categories?: CategoryWithChildren[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const closeMenu = () => setIsOpen(false);

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
          onClick={closeMenu}
        />

        {/* Menu Panel */}
        <div className={`absolute top-0 left-0 w-[280px] h-full bg-surface-card border-r border-zinc-800/50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-surface-bg/50 transition-colors duration-300 shrink-0">
            <span className="text-lg font-black tracking-tighter text-white">
              <span className="text-brand transition-colors duration-300">ALL</span> MENUS
            </span>
            <button onClick={closeMenu} className="text-zinc-500 hover:text-white transition-colors duration-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="py-4 flex flex-col overflow-y-auto flex-grow pb-24" style={{ scrollbarWidth: 'none' }}>

            {/* --- USER PROFILE / LOGIN SECTION --- */}
            <div className="px-4">
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
                    <Link href="/profile" onClick={closeMenu} className="text-[10px] text-brand hover:underline mt-0.5">
                      View My Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mb-4 pb-4 border-b border-zinc-800/50">
                  <button
                    onClick={() => { closeMenu(); signIn("google"); }}
                    className="flex w-full items-center justify-center gap-3 p-3.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] active:scale-95"
                  >
                    <GoogleIcon className="w-5 h-5" />
                    Login via Google
                  </button>
                </div>
              )}
            </div>

            {/* --- MAIN MENU --- */}
            <MenuSectionTitle title="Main Menu" />
            <div className="flex flex-col gap-1 px-3">
              <MobileNavLink href="/" icon={<Home className="w-4 h-4"/>} label="Home" onClick={closeMenu} />
              <MobileNavLink href="/products?onSale=true" icon={<TicketPercent className="w-4 h-4"/>} label="Promotions" onClick={closeMenu} />
              <MobileNavLink href="/profile" icon={<Truck className="w-4 h-4"/>} label="Track Order" onClick={closeMenu} />
            </div>

            {/* --- CATEGORIES --- */}
            <MenuSectionTitle title="Categories" />
            <div className="flex flex-col gap-1 px-3">
              <MobileNavLink href="/products?category=all" icon={<Package className="w-4 h-4"/>} label="All Categories" onClick={closeMenu} />

              <div className="mt-2 flex flex-col gap-1">
                {categories.map((category) => (
                  <CategoryAccordionItem key={category.id} category={category} closeMenu={closeMenu} />
                ))}
              </div>
            </div>

            {/* --- SERVICES & SUPPORT --- */}
            <MenuSectionTitle title="Services & Support" />
            <div className="flex flex-col gap-1 px-3">
              <MobileNavLink href="/service-center" icon={<Wrench className="w-4 h-4"/>} label="Service Center" onClick={closeMenu} />
              <MobileNavLink href="/bank-details" icon={<Landmark className="w-4 h-4"/>} label="Bank Details" onClick={closeMenu} />
              <MobileNavLink href="/quotation" icon={<Package className="w-4 h-4"/>} label="Get Quotation" onClick={closeMenu} />
              <MobileNavLink href="/about" icon={<Info className="w-4 h-4"/>} label="About Us" onClick={closeMenu} />
              <MobileNavLink href="/contact" icon={<PhoneCall className="w-4 h-4"/>} label="Contact Us" onClick={closeMenu} />
            </div>

            {/* --- ADMIN --- */}
            {session?.user?.role === "ADMIN" && (
              <>
                <MenuSectionTitle title="Administration" />
                <div className="flex flex-col gap-1 px-3">
                  <MobileNavLink href="/admin" icon={<Shield className="w-4 h-4"/>} label="Admin Dashboard" onClick={closeMenu} />
                </div>
              </>
            )}

            {/* --- FOLLOW US --- */}
            <div className="mt-8 pt-6 border-t border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-5 mb-4">Follow Us</p>
              <div className="flex gap-6 px-5">
                <FacebookIcon className="w-5 h-5 text-zinc-400 hover:text-brand transition-colors duration-300 cursor-pointer" />
                <YoutubeIcon className="w-5 h-5 text-zinc-400 hover:text-brand transition-colors duration-300 cursor-pointer" />
              </div>
            </div>
          </nav>

          {/* LOGOUT SECTION */}
          {session?.user && (
            <div className="p-4 border-t border-zinc-800/50 shrink-0 bg-surface-card mt-auto z-10">
              <button
                onClick={() => {
                  closeMenu();
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

// --- HELPER COMPONENTS ---

function MenuSectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest px-5 mt-6 mb-3">
      {title}
    </h3>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between p-3.5 rounded-xl hover:bg-surface-bg/50 border border-transparent hover:border-brand/20 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 text-zinc-300 group-hover:text-white transition-colors duration-300">
        <span className="text-brand transition-colors duration-300">{icon}</span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-brand transition-colors duration-300" />
    </Link>
  );
}

function CategoryAccordionItem({ category, closeMenu }: { category: CategoryWithChildren, closeMenu: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="flex flex-col">
      {hasChildren ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-surface-bg/50 border border-transparent hover:border-brand/20 transition-all duration-300 group w-full text-left"
          >
            <div className="flex items-center gap-4 text-zinc-300 group-hover:text-white transition-colors duration-300">
              <Folder className="w-4 h-4 text-brand fill-brand/20" />
              <span className="text-sm font-bold uppercase tracking-wider">{category.name}</span>
            </div>
            <div className={`p-1 rounded-md border transition-colors duration-300 ${isOpen ? 'border-brand/50 bg-brand/10' : 'border-zinc-700/50'}`}>
               <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand" : "text-zinc-500 group-hover:text-brand"}`} />
            </div>
          </button>

          {/* Subcategories Dropdown */}
          <div className={`flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="flex flex-col gap-1 pl-8 ml-2 border-l border-zinc-800 mt-1 mb-2">
              {category.children!.map(child => (
                <Link
                  key={child.id}
                  href={`/products?category=${child.slug}`}
                  onClick={closeMenu}
                  className="py-2.5 px-3 text-[11px] font-bold text-zinc-400 hover:text-brand flex items-center gap-3 transition-colors uppercase tracking-widest rounded-lg hover:bg-surface-bg/30"
                >
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Link
          href={`/products?category=${category.slug}`}
          onClick={closeMenu}
          className="flex items-center justify-between p-3.5 rounded-xl hover:bg-surface-bg/50 border border-transparent hover:border-brand/20 transition-all duration-300 group w-full text-left"
        >
          <div className="flex items-center gap-4 text-zinc-300 group-hover:text-white transition-colors duration-300">
            <Folder className="w-4 h-4 text-brand fill-brand/20" />
            <span className="text-sm font-bold uppercase tracking-wider">{category.name}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-brand transition-colors duration-300" />
        </Link>
      )}
    </div>
  );
}

// --- ICONS ---

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
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