// components/navbar.tsx
"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { CartButton } from "@/components/client/cart-button";
import {
  Phone, Mail, AlertTriangle, Facebook, Youtube,
  ChevronDown, User, Menu, ChevronRight, Shield, Heart
} from "lucide-react";
import { SearchBar } from "@/components/client/search-bar";
import { MobileMenuButton } from "@/components/client/mobile-menu-button";
import { Category, SiteSetting } from "@prisma/client";
// --- NEW: Imports for Breadcrumbs ---
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface CategoryWithChildren extends Category {
  children: Category[];
}

// --- NEW: Dedicated Breadcrumb Component ---
function BreadcrumbNavigation({ categories }: { categories: CategoryWithChildren[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Don't show breadcrumbs on the homepage
  if (pathname === "/") return null;

  const breadcrumbs = [{ label: "HOME", href: "/" }];

  if (pathname.startsWith("/products")) {
    breadcrumbs.push({ label: "PRODUCTS", href: "/products" });

    const categorySlug = searchParams.get("category");
    if (categorySlug && categorySlug !== "all") {
      let found = false;

      // Scan categories to find parent/child relationships for the breadcrumb
      for (const cat of categories) {
        if (cat.slug === categorySlug) {
          breadcrumbs.push({ label: cat.name.toUpperCase(), href: `/products?category=${cat.slug}` });
          found = true;
          break;
        }
        for (const child of cat.children) {
          if (child.slug === categorySlug) {
            // Push Parent first, then Child
            breadcrumbs.push({ label: cat.name.toUpperCase(), href: `/products?category=${cat.slug}` });
            breadcrumbs.push({ label: child.name.toUpperCase(), href: `/products?category=${child.slug}` });
            found = true;
            break;
          }
        }
        if (found) break;
      }

      // Fallback if category slug wasn't found in DB list
      if (!found) {
        breadcrumbs.push({ label: categorySlug.replace(/-/g, " ").toUpperCase(), href: `/products?category=${categorySlug}` });
      }
    }
  } else if (pathname.startsWith("/product/")) {
    breadcrumbs.push({ label: "PRODUCTS", href: "/products" });
    const productSlug = pathname.split("/product/")[1];
    if (productSlug) {
      breadcrumbs.push({ label: productSlug.replace(/-/g, " ").toUpperCase(), href: pathname });
    }
  } else {
    // Generic fallback for pages like /about, /contact, etc.
    const pathSegments = pathname.split('/').filter(Boolean);
    pathSegments.forEach((seg, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      breadcrumbs.push({ label: seg.replace(/-/g, " ").toUpperCase(), href });
    });
  }

  return (
    <div className="bg-surface-bg border-b border-theme-border py-2.5 transition-colors duration-300">
      <div className="container mx-auto px-4 flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-theme-muted overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.href} className="flex items-center gap-2">
            <Link href={crumb.href} className="hover:text-brand transition-colors duration-300">
              {crumb.label}
            </Link>
            {idx < breadcrumbs.length - 1 && (
              <ChevronRight className="w-3 h-3 opacity-50" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Navbar({
  categories,
  settings
}: {
  categories: CategoryWithChildren[],
  settings?: Partial<SiteSetting> | null
}) {
  const { data: session } = useSession();

  const storeName = settings?.storeName || "EPIC STORE";
  const nameParts = storeName.trim().split(" ");
  const firstWord = nameParts[0];
  const restOfName = nameParts.slice(1).join(" ");

  return (
    <header className="w-full font-sans flex flex-col z-50 sticky top-0 shadow-2xl">

      {/* TIER 1: Top Contact Bar */}
      <div className="bg-surface-bg border-b border-theme-border hidden md:block transition-colors duration-300">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-[11px] font-bold tracking-wider">
          <div className="flex items-center gap-6 text-brand">
            <span className="flex items-center gap-2">
              <Phone className="w-3 h-3" /> {settings?.contactPhone || "0112 95 9005 / 0777 50 69 39"}
            </span>
            <span className="flex items-center gap-2 border-l border-theme-border pl-6 transition-colors duration-300">
              <Mail className="w-3 h-3" /> {settings?.contactEmail || "info@epicgenstore.lk"}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-brand">
              <AlertTriangle className="w-3 h-3" /> {settings?.promoBanner || "Island Wide Express Delivery Available"}
            </span>
            <span className="flex items-center gap-3 text-theme-muted border-l border-theme-border pl-6 transition-colors duration-300">
              Follow:
              <a href={settings?.facebookUrl || "#"} target="_blank" rel="noreferrer">
                <Facebook className="w-3.5 h-3.5 text-theme-main hover:text-brand cursor-pointer transition-colors"/>
              </a>
              <a href={settings?.youtubeUrl || "#"} target="_blank" rel="noreferrer">
                <Youtube className="w-3.5 h-3.5 text-theme-main hover:text-brand cursor-pointer transition-colors"/>
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* TIER 2: Main Search & Logo Bar */}
      <div className="bg-surface-bg py-4 border-b border-theme-border transition-colors duration-300">
        <div className="container mx-auto px-4 flex items-center justify-between gap-6 lg:gap-12">

          <div className="lg:hidden">
            <MobileMenuButton />
          </div>

          <div className="flex flex-col flex-shrink-0">
            <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter text-theme-main flex items-center gap-1.5 hover:opacity-90 transition-all duration-300">
              <span className="bg-brand text-black px-2 py-0.5 rounded-md italic transition-colors duration-300">{firstWord}</span>
              {restOfName && <span>{restOfName}</span>}
            </Link>
            <span className="text-[9px] text-theme-muted font-bold tracking-[0.2em] uppercase mt-1 pl-1 hidden sm:block transition-colors duration-300">
              Empowering Tech Solutions, Every Day.
            </span>
          </div>

          <SearchBar />

          <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
            {session?.user ? (
              <div className="flex items-center gap-3 sm:gap-4">

                {/* --- USER PROFILE DROPDOWN --- */}
                <div className="relative group/user">
                  <div className="flex items-center gap-3 cursor-pointer py-2">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-theme-main group-hover/user:text-brand transition-colors duration-300">
                        Hi, {session.user.name?.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-theme-muted uppercase tracking-wider font-bold mt-0.5 flex items-center gap-1 transition-colors duration-300">
                        Account <ChevronDown className="w-3 h-3 group-hover/user:rotate-180 transition-transform duration-300" />
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-surface-bg border border-theme-border flex items-center justify-center text-theme-muted group-hover/user:text-brand group-hover/user:border-brand transition-colors duration-300 overflow-hidden shadow-sm">
                      {session.user.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* The Dropdown Box */}
                  <div className="absolute top-[100%] right-0 w-56 bg-surface-card border border-theme-border rounded-xl shadow-2xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 z-50 overflow-hidden translate-y-2 group-hover/user:translate-y-0">
                    <div className="p-4 border-b border-theme-border bg-surface-bg/50 transition-colors duration-300">
                      <p className="text-sm font-bold text-theme-main truncate transition-colors duration-300">{session.user.name}</p>
                      <p className="text-[10px] text-theme-muted truncate transition-colors duration-300">{session.user.email}</p>
                    </div>
                    <div className="flex flex-col p-2">
                      <Link href="/profile" className="px-3 py-2 text-sm font-bold text-theme-main hover:text-brand hover:bg-surface-bg rounded-lg transition-colors duration-300 flex items-center gap-2">
                        <User className="w-4 h-4" /> My Profile
                      </Link>

                      {session.user.role === "ADMIN" && (
                        <Link href="/admin" className="px-3 py-2 text-sm font-bold text-theme-main hover:text-brand hover:bg-surface-bg rounded-lg transition-colors duration-300 flex items-center gap-2">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => signOut()}
                        className="px-3 py-2 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-left w-full mt-1 border-t border-theme-border/50 pt-3"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => signIn("google")} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-surface-bg border border-theme-border flex items-center justify-center text-theme-muted group-hover:text-brand group-hover:border-brand transition-colors duration-300">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-theme-main group-hover:text-brand hidden sm:block transition-colors duration-300">Account</span>
              </button>
            )}

            <div className="flex items-center gap-4 pl-4 sm:pl-8 border-l border-theme-border transition-colors duration-300">
              {session?.user && (
                <Link href="/wishlist" className="relative p-2 text-theme-muted hover:text-brand transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
              )}
              <CartButton />
            </div>
          </div>
        </div>
      </div>

      {/* TIER 3: Bottom Navigation Links (Desktop Only) */}
      <nav className="bg-surface-bg border-b border-theme-border hidden lg:block shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 text-sm font-bold text-theme-main transition-colors duration-300">
            <li><Link href="/" className="py-4 block hover:text-brand transition-colors">Home</Link></li>

            {/* --- ADVANCED CATEGORIES DROPDOWN --- */}
            <li className="relative group py-4">
              <div className="flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer">
                Categories
                <ChevronDown className="w-4 h-4 text-brand group-hover:rotate-180 transition-all duration-300"/>
              </div>

              {/* The Dropdown Menu Box */}
              <div className="absolute top-[100%] left-0 w-80 bg-surface-bg border border-theme-border rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-y-auto max-h-[75vh]">
                <div className="p-4">
                  <div className="text-brand text-[11px] font-black uppercase tracking-widest border-b border-theme-border/80 pb-3 mb-3 transition-colors duration-300">
                    Browse Categories
                  </div>

                  <div className="flex flex-col gap-1">
                    {categories.map((category) => (
                      <div key={category.id} className="flex flex-col">
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="flex items-center justify-between px-3 py-3 text-sm font-bold text-theme-main hover:text-brand hover:bg-surface-card rounded-lg transition-colors duration-300 group/parent"
                        >
                          <span className="flex items-center gap-3">
                            <Menu className="w-4 h-4 text-brand" />
                            {category.name}
                          </span>
                          {category.children.length > 0 && (
                            <ChevronRight className="w-4 h-4 text-theme-muted group-hover/parent:text-brand transition-colors duration-300" />
                          )}
                        </Link>

                        {/* Indented Subcategories */}
                        {category.children.length > 0 && (
                          <div className="flex flex-col pl-10 pr-2 pb-2 gap-0.5">
                            {category.children.map(child => (
                              <Link
                                key={child.id}
                                href={`/products?category=${child.slug}`}
                                className="flex items-center gap-2 text-[13px] font-medium text-theme-muted hover:text-brand py-2 transition-colors duration-300"
                              >
                                <ChevronRight className="w-3 h-3 opacity-40" />
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 pt-3 border-t border-theme-border transition-colors duration-300">
                    <Link
                      href="/products?category=all"
                      className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-black text-brand hover:bg-brand hover:text-black rounded-lg transition-colors"
                    >
                      View All Categories <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
            <li><Link href="/products" className="py-4 block hover:text-brand transition-colors">All Products</Link></li>
            <li><Link href="/quotation" className="py-4 block hover:text-brand transition-colors">Get a Quotation</Link></li>
            <li><Link href="/products?onSale=true" className="py-4 block hover:text-brand transition-colors">Promotions</Link></li>
            <li><Link href="/profile" className="py-4 block hover:text-brand transition-colors">Track Order</Link></li>
            <li><Link href="/service-center" className="py-4 block hover:text-brand transition-colors">Service Center</Link></li>
            <li><Link href="/bank-details" className="py-4 block hover:text-brand transition-colors">Bank Details</Link></li>
            <li><Link href="/about" className="py-4 block hover:text-brand transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="py-4 block hover:text-brand transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className="bg-surface-bg p-4 md:hidden border-b border-theme-border transition-colors duration-300">
        <SearchBar isMobile={true} />
      </div>

      {/* --- TIER 4: NEW BREADCRUMB NAVIGATION --- */}
      <Suspense fallback={null}>
        <BreadcrumbNavigation categories={categories} />
      </Suspense>

    </header>
  );
}