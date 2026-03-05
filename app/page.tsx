// app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button"; // Added missing Button import
import { AddToCartButton } from "@/components/client/add-to-cart-button";
import { HeroCarousel } from "@/components/client/hero-carousel";
import { WishlistButton } from "@/components/client/wishlist-button";
import { CarouselItem } from "./(admin)/admin/settings/page";
import { Monitor, Cpu, Truck, ShieldCheck, Wrench, HeadphonesIcon, ChevronRight } from "lucide-react";

import { getExperienceImages } from "@/app/actions/customer-experience";
import { CustomerExperiencesCarousel } from "@/components/homepage/CustomerExperiencesCarousel";
import { ProductCarousel } from "@/components/client/product-carousel";
import { CategoryCarousel } from "@/components/client/category-carousel";

export const revalidate = 0;

export default async function HomePage() {
  const session = await auth();

  const settings = await prisma.siteSetting.findUnique({
    where: { id: 1 },
  }) || {
    heroTitle: "Welcome to EpicGenStore",
    heroSubtitle: "Discover our enterprise-grade collection.",
    heroImageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    latestArrivalsTitle: "Latest Promotions",
    carouselItems: []
  };

  const carouselItems = (settings.carouselItems as unknown as CarouselItem[]) || [];

  // Fetch Promo products in parallel with the Active Carousels and Image Categories
  const [promoProducts, activeCarousels, experienceImages, categories] = await Promise.all([
    prisma.product.findMany({
      where: { onSale: true },
      take: 4,
      orderBy: { updatedAt: "desc" },
    }),
    // Fetch all visible category carousels.
    prisma.carousel.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'asc' },
      include: {
        category: {
          include: {
            products: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              include: { categories: true }
            }
          }
        }
      }
    }),
    getExperienceImages(),
    // Fetch only categories that have an image assigned
    prisma.category.findMany({
      where: { imageUrl: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, imageUrl: true }
    })
  ]);

  let wishlistedIds: string[] = [];
  if (session?.user?.id) {
    const userWishlist = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    });
    wishlistedIds = userWishlist.map((w) => w.productId);
  }

  return (
    <div className="min-h-screen bg-surface-bg text-theme-main font-sans pb-24 transition-colors duration-300">
      {/* --- DYNAMIC HERO SECTION --- */}
      {carouselItems.length > 0 ? (
        <HeroCarousel items={carouselItems} />
      ) : (
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.heroImageUrl}
              alt="Hero Background"
              className="w-full h-full object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
              {settings.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 mb-10 font-medium">
              {settings.heroSubtitle}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="bg-brand hover:bg-brand-hover text-black font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- SHOP BY CATEGORY CAROUSEL --- */}
      {categories.length > 0 && (
        <section className="pt-16">
          <CategoryCarousel categories={categories} />
        </section>
      )}

      {/* --- FEATURES GRID (Why Choose Us) --- */}
      <section className="py-20 px-4 container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-theme-main">Why Choose Us?</h2>
          <p className="text-theme-muted">Premium expertise, quality products, and exceptional service.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: Monitor, title: "Gaming PCs", desc: "High-performance setups" },
            { icon: Cpu, title: "Components", desc: "Latest PC hardware" },
            { icon: ShieldCheck, title: "Best Warranty", desc: "Peace of mind guaranteed" },
            { icon: Truck, title: "Island-wide Delivery", desc: "Fast & secure shipping" },
            { icon: Wrench, title: "Expert Service", desc: "Professional repairs" },
            { icon: HeadphonesIcon, title: "24/7 Support", desc: "Always here to help" },
          ].map((feature) => (
            <div key={feature.title} className="bg-surface-card/50 border border-theme-border rounded-2xl p-6 flex flex-col items-center text-center hover:bg-surface-card transition-colors duration-300">
              <feature.icon className="h-10 w-10 text-brand mb-4 transition-colors duration-300" />
              <h3 className="font-bold text-lg mb-1 text-theme-main">{feature.title}</h3>
              <p className="text-xs text-theme-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- LATEST PROMOTIONS SECTION --- */}
      <section className="py-16 px-4 bg-surface-card/30 border-y border-theme-border transition-colors duration-300">
        <div className="container mx-auto max-w-7xl">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-theme-main">
              {settings.latestArrivalsTitle}
            </h2>
            <p className="text-theme-muted">Discover our latest additions and special offers.</p>
          </div>

          {/* Promo Grid - UPDATED FOR MOBILE 2x2 */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-16">
            {promoProducts.map((product) => (
              <div key={product.id} className="bg-surface-bg border border-theme-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-lg duration-300">

                <div className="relative aspect-[4/3] bg-surface-card/50 overflow-hidden border-b border-theme-border group/img">
                  <Link href={`/product/${product.slug}`} className="absolute inset-0 p-4 md:p-6 flex items-center justify-center z-0">
                    {product.imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-contain transform group-hover/img:scale-110 transition-all duration-500 drop-shadow-2xl ${
                            product.images && product.images.length > 0 ? 'group-hover/img:opacity-0' : ''
                          }`}
                        />
                        {/* Secondary Hover Image */}
                        {product.images && product.images.length > 0 && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.images[0]}
                            alt={`${product.name} alternate view`}
                            className="absolute inset-0 p-4 md:p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-500 drop-shadow-2xl"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-muted text-xs md:text-sm font-black tracking-widest uppercase text-center">No Image</div>
                    )}
                  </Link>

                  <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none">
                    {product.stock > 0 ? (
                      <span className="bg-green-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider">IN STOCK</span>
                    ) : (
                      <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider">SOLD OUT</span>
                    )}

                    <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider animate-pulse">
                      PROMO
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                    <WishlistButton
                      productId={product.id}
                      initialIsWishlisted={wishlistedIds.includes(product.id)}
                    />
                  </div>
                </div>

                <div className="p-3 md:p-5 flex flex-col flex-grow z-10 bg-surface-bg">
                  <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                    <h3 className="font-bold text-xs md:text-sm leading-snug line-clamp-2 mb-2 md:mb-3 text-theme-main">{product.name}</h3>
                  </Link>

                  <div className="mt-auto pt-2 md:pt-4 flex flex-col gap-2 md:gap-4">
                    <div className="font-black text-sm md:text-lg">
                      {product.salePrice ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] md:text-xs text-theme-muted line-through">LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-red-500">LKR {Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ) : (
                        <span className="text-brand transition-colors duration-300">LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>

                    <AddToCartButton product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.salePrice ? Number(product.salePrice) : Number(product.price),
                      imageUrl: product.imageUrl,
                    }} isCard={true} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {promoProducts.length === 0 && (
            <div className="text-center py-12 mb-16 border border-theme-border border-dashed rounded-2xl bg-surface-card/30">
              <p className="text-theme-muted font-medium">No active promotions at the moment. Check back soon!</p>
            </div>
          )}

          <div className="flex justify-center">
            <Link
              href="/products?onSale=true"
              className="border-2 border-brand text-brand hover:bg-brand hover:text-black font-black text-xs md:text-sm uppercase tracking-widest py-3 px-8 rounded-full transition-all shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/40 duration-300"
            >
              View All Promotions
            </Link>
          </div>

        </div>
      </section>

      {/* --- NEW: DYNAMIC SHOP BY CATEGORY CAROUSELS & MIXED LAYOUTS --- */}
      {activeCarousels.map((carousel) => {
        // Extract product details and category info once.
        const productDetails = carousel.category?.products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          imageUrl: product.imageUrl,
          images: product.images,
          stock: product.stock,
          onSale: product.onSale,
          category: product.categories && product.categories.length > 0 ? product.categories[0] : null,
        })) || [];

        // Choose which layout to render based on the new banner fields.
        if (carousel.imageUrl) {
          // Mixed Layout (Target Design)
          return (
            <BannerCategoryLayout
              key={carousel.id}
              id={carousel.id}
              title={carousel.title}
              categorySlug={carousel.category?.slug || ""}
              banner={{
                imageUrl: carousel.imageUrl,
                imageTitle: carousel.imageTitle,
                imageSubtitle: carousel.imageSubtitle,
                imageButtonText: carousel.imageButtonText,
              }}
              products={productDetails}
              wishlistedIds={wishlistedIds}
            />
          );
        } else {
          // Standard Products-Only Layout (Current State)
          if (!carousel.category) return null; // Safety check
          return (
            <section key={carousel.id} className="pt-8 px-4 container mx-auto max-w-7xl">
              <ProductCarousel
                title={carousel.title}
                categorySlug={carousel.category.slug}
                products={productDetails}
                wishlistedIds={wishlistedIds}
              />
            </section>
          );
        }
      })}

      {/* --- CUSTOMER EXPERIENCES CAROUSEL --- */}
      <CustomerExperiencesCarousel images={experienceImages} />

    </div>
  );
}

// --- FIXED: Corrected TypeScript syntax for all props ---
function BannerCategoryLayout({
  id, title, categorySlug, banner, products, wishlistedIds
}: {
  id: number,
  title: string,
  categorySlug: string,
  banner: { imageUrl: string | null, imageTitle: string | null, imageSubtitle: string | null, imageButtonText: string | null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[],
  wishlistedIds: string[]
}) {
  return (
    <section key={id} className="py-16 px-4 container mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8 md:mb-12 border-b-4 border-theme-border pb-4 md:pb-6 transition-colors duration-300">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-theme-main tracking-tighter transition-colors duration-300">
          {title}
        </h2>
        <Link href={`/products?category=${categorySlug}`} className="text-theme-muted hover:text-brand font-black text-[10px] md:text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-300 group">
          View All <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-theme-muted group-hover:text-brand transition-colors"/>
        </Link>
      </div>

      {/* UPDATED FOR MOBILE 2x2: grid-cols-2 instead of grid-cols-1 */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 items-start">

        {/* Promotional Banner Image Card - Span 2 columns on mobile so it doesn't get squeezed */}
        <div className="col-span-2 lg:col-span-1 aspect-[16/9] lg:aspect-[3/4] rounded-xl md:rounded-2xl border border-theme-border transition-colors duration-300 relative overflow-hidden flex items-end p-6 md:p-8 flex-col shadow-2xl">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl || "placeholder.jpg"} alt={banner.imageTitle || title} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>
          </div>
          <div className="relative z-10 text-center w-full mt-auto space-y-2 md:space-y-4">
            <span className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">{banner.imageSubtitle || "Epic Deals"}</span>
            <h1 className="text-2xl md:text-4xl font-black mb-1 leading-tight text-white">{banner.imageTitle || title}</h1>
            <Button asChild className="w-full bg-theme-main text-black hover:bg-brand transition-colors duration-300 font-bold uppercase tracking-widest text-[10px] md:text-[11px] py-4 md:py-6 rounded-xl">
              <Link href={`/products?category=${categorySlug}`}>{banner.imageButtonText || "Shop Now"}</Link>
            </Button>
          </div>
        </div>

        {/* Subsequent Product Cards */}
        {products.map(product => (
          <div key={product.id} className="bg-surface-bg border border-theme-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-lg duration-300">
            <div className="relative aspect-[4/3] bg-surface-card/50 overflow-hidden border-b border-theme-border group/img">
              <Link href={`/product/${product.slug}`} className="absolute inset-0 p-4 md:p-6 flex items-center justify-center z-0">
                {product.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={`w-full h-full object-contain transform group-hover/img:scale-110 transition-all duration-500 drop-shadow-2xl ${
                        product.images && product.images.length > 0 ? 'group-hover/img:opacity-0' : ''
                      }`}
                    />
                    {/* --- FIXED: Secondary Hover Image for Mixed Layout Cards --- */}
                    {product.images && product.images.length > 0 && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.images[0]}
                        alt={`${product.name} alternate view`}
                        className="absolute inset-0 p-4 md:p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-500 drop-shadow-2xl"
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-theme-muted text-xs md:text-sm font-black tracking-widest uppercase text-center">No Image</div>
                )}
              </Link>

              <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none">
                {product.stock > 0 ? (
                  <span className="bg-green-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider">IN STOCK</span>
                ) : (
                  <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider">SOLD OUT</span>
                )}
                {product.onSale && (
                  <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider animate-pulse">
                    PROMO
                  </span>
                )}
              </div>

              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                <WishlistButton
                  productId={product.id}
                  initialIsWishlisted={wishlistedIds.includes(product.id)}
                />
              </div>
            </div>

            <div className="p-3 md:p-5 flex flex-col flex-grow z-10 bg-surface-bg">
              <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                <h3 className="font-bold text-xs md:text-sm leading-snug line-clamp-2 mb-2 md:mb-3 text-theme-main">{product.name}</h3>
              </Link>

              <div className="mt-auto pt-2 md:pt-4 flex flex-col gap-2 md:gap-4">
                <div className="font-black text-sm md:text-lg">
                  {product.onSale && product.salePrice ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] md:text-xs text-theme-muted line-through">LKR {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className="text-red-500">LKR {product.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ) : (
                    <span className="text-brand transition-colors duration-300">LKR {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  )}
                </div>

                <AddToCartButton product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.onSale && product.salePrice ? product.salePrice : product.price,
                  imageUrl: product.imageUrl,
                }} isCard={true} />
              </div>
            </div>
          </div>
        ))}

        {/* Display a message if no products are in the category --- */}
        {products.length === 0 && (
          <div className="col-span-2 lg:col-span-3 text-center py-12 border border-theme-border border-dashed rounded-2xl bg-surface-card/30">
            <p className="text-theme-muted font-medium transition-colors duration-300">No products found for this category.</p>
          </div>
        )}

      </div>
    </section>
  );
}