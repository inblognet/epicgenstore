// app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/client/add-to-cart-button";
import { HeroCarousel } from "@/components/client/hero-carousel";
import { WishlistButton } from "@/components/client/wishlist-button";
import { CarouselItem } from "./(admin)/admin/settings/page";
import { Monitor, Cpu, Truck, ShieldCheck, Wrench, HeadphonesIcon, ChevronRight, RefreshCcw } from "lucide-react";

import { getExperienceImages } from "@/app/actions/customer-experience";
import { CustomerExperiencesCarousel } from "@/components/homepage/CustomerExperiencesCarousel";
import { ProductCarousel } from "@/components/client/product-carousel";
import { CategoryCarousel } from "@/components/client/category-carousel";
// NEW: Import our scroll animation wrapper!
import { ScrollAnimate } from "@/components/client/scroll-animate";

export const revalidate = 3600; // Cached for speed!

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

  // Fetch Promo products, New Arrivals, Active Carousels, and Categories in parallel
  const [promoProducts, newArrivalProducts, activeCarousels, experienceImages, categories] = await Promise.all([
    prisma.product.findMany({
      where: { onSale: true },
      take: 4,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
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
    <div className="min-h-screen bg-surface-bg text-theme-main font-sans transition-colors duration-300 overflow-hidden">

      {/* --- DYNAMIC HERO SECTION --- */}
      <ScrollAnimate animation="fade-in">
        {carouselItems.length > 0 ? (
          <HeroCarousel items={carouselItems} />
        ) : (
          <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.heroImageUrl}
                alt="Hero Background"
                className="w-full h-full object-cover object-center opacity-40 transition-transform duration-[10s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <ScrollAnimate animation="fade-up" delay={200} className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
                {settings.heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-300 mb-10 font-medium">
                {settings.heroSubtitle}
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/products"
                  className="bg-brand hover:bg-brand-hover text-black font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--color-brand),0.4)]"
                >
                  Shop Now
                </Link>
              </div>
            </ScrollAnimate>
          </section>
        )}
      </ScrollAnimate>

      {/* --- SHOP BY CATEGORY CAROUSEL --- */}
      {categories.length > 0 && (
        <ScrollAnimate animation="fade-up" delay={100} className="pt-16">
          <CategoryCarousel categories={categories} />
        </ScrollAnimate>
      )}

      {/* --- NEW ARRIVALS SECTION --- */}
      <section className="py-12 md:py-16 px-4 container mx-auto max-w-7xl">
        <ScrollAnimate animation="fade-in" className="flex items-center justify-between mb-8 md:mb-10 border-b border-theme-border pb-4 transition-colors duration-300 group">
          <h2 className="text-xl md:text-3xl font-black text-theme-main tracking-[0.2em] uppercase transition-colors group-hover:text-brand">
            NEW ARRIVALS
          </h2>
          <Link href="/products?sort=newest" className="text-theme-muted hover:text-brand font-black text-[10px] md:text-xs uppercase tracking-[0.1em] flex items-center gap-1.5 transition-all duration-300 hover:translate-x-1">
            View All <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-theme-muted group-hover:text-brand transition-colors"/>
          </Link>
        </ScrollAnimate>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 items-stretch">
          {newArrivalProducts.map((product, index) => {
            const activePrice = product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price);
            const installmentPrice = (activePrice / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

            return (
              // STAGGERED DELAY EFFECT (index * 100)
              <ScrollAnimate key={product.id} animation="fade-up" delay={index * 100} className="h-full">
                <div className="h-full bg-transparent border border-theme-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-2 duration-500">
                  <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-transparent overflow-hidden border-b border-theme-border shrink-0 transition-colors duration-300 group/img">
                    {product.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={product.imageUrl} alt={product.name} className="absolute inset-0 p-3 md:p-6 object-contain w-full h-full transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-muted text-[10px] md:text-sm font-black tracking-widest uppercase text-center absolute inset-0">No Image</div>
                    )}

                    <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none">
                      <span className="bg-brand text-black text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit transform group-hover/img:scale-110 transition-transform duration-300">NEW</span>
                    </div>

                    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 scale-90 md:scale-100 origin-top-right transform group-hover/img:scale-110 transition-transform duration-300">
                      <WishlistButton productId={product.id} initialIsWishlisted={wishlistedIds.includes(product.id)} />
                    </div>
                  </Link>

                  <div className="p-3 md:p-5 flex flex-col flex-grow z-10 bg-transparent">
                    <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                      <h3 className="font-bold text-[11px] md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide">{product.name}</h3>
                    </Link>

                    <div className="flex items-center gap-1.5 mb-3 md:mb-4">
                      <div className="flex text-theme-muted/50 text-[10px] tracking-widest">★★★★★</div>
                      <span className="text-[8px] md:text-[9px] text-theme-muted">(reviews)</span>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                      <div className="flex items-end justify-between gap-2">
                        <div className="font-black text-sm md:text-lg text-theme-main transition-colors duration-300 leading-none">
                          <span className="text-[9px] md:text-[10px] text-theme-muted block mb-1 tracking-widest uppercase font-bold">LKR</span>
                          {product.onSale && product.salePrice ? (
                            <div className="flex flex-col">
                              <span className="text-[9px] md:text-xs text-theme-muted line-through leading-none mb-0.5">{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              <span className="text-red-500">{Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ) : (
                            <span>{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          )}
                        </div>

                        <div className="shrink-0 mt-1 md:mt-0 transition-transform hover:scale-105 duration-300">
                          <AddToCartButton product={{ id: product.id, name: product.name, slug: product.slug, price: activePrice, imageUrl: product.imageUrl }} isCard={true} />
                        </div>
                      </div>

                      <div className="text-[8px] md:text-[10px] text-theme-muted font-medium mt-1">
                        or 3 X <span className="font-bold text-theme-main">LKR {installmentPrice}</span> with <span className="text-[#a855f7] font-black italic tracking-wider">KOKO</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimate>
            );
          })}
        </div>
      </section>

      {/* --- FEATURES GRID (Why Choose Us) --- */}
      <section className="py-12 md:py-20 px-4 container mx-auto max-w-6xl">
        <ScrollAnimate animation="fade-up" className="text-center mb-10 md:mb-12 group">
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-theme-main tracking-[0.2em] uppercase transition-colors group-hover:text-brand">WHY CHOOSE US?</h2>
          <p className="text-theme-muted text-sm">Premium expertise, quality products, and exceptional service.</p>
        </ScrollAnimate>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: Monitor, title: "Gaming PCs", desc: "High-performance setups" },
            { icon: Cpu, title: "Components", desc: "Latest PC hardware" },
            { icon: ShieldCheck, title: "Best Warranty", desc: "Peace of mind guaranteed" },
            { icon: Truck, title: "Island-wide Delivery", desc: "Fast & secure shipping" },
            { icon: Wrench, title: "Expert Service", desc: "Professional repairs" },
            { icon: HeadphonesIcon, title: "24/7 Support", desc: "Always here to help" },
          ].map((feature, index) => (
            <ScrollAnimate key={feature.title} animation="scale-up" delay={index * 100} className="h-full">
              <div className="bg-transparent border border-theme-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-brand hover:bg-surface-card hover:shadow-[0_0_20px_rgba(var(--color-brand),0.1)] hover:-translate-y-2 transition-all duration-500 group h-full">
                <feature.icon className="h-8 w-8 md:h-10 md:w-10 text-brand mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
                <h3 className="font-bold text-sm md:text-lg mb-1 text-theme-main">{feature.title}</h3>
                <p className="text-[10px] md:text-xs text-theme-muted">{feature.desc}</p>
              </div>
            </ScrollAnimate>
          ))}
        </div>
      </section>

      {/* --- LATEST PROMOTIONS SECTION --- */}
      <section className="py-16 px-4 bg-surface-card/10 border-y border-theme-border transition-colors duration-300">
        <div className="container mx-auto max-w-7xl">

          <ScrollAnimate animation="fade-in" className="flex items-center justify-between mb-8 md:mb-10 border-b border-theme-border pb-4 transition-colors duration-300 group">
            <h2 className="text-xl md:text-3xl font-black text-theme-main tracking-[0.2em] uppercase transition-colors group-hover:text-brand">
              {settings.latestArrivalsTitle || "LATEST PROMOTIONS"}
            </h2>
            <Link href="/products?onSale=true" className="text-theme-muted hover:text-brand font-black text-[10px] md:text-xs uppercase tracking-[0.1em] flex items-center gap-1.5 transition-all duration-300 hover:translate-x-1">
              View All <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-theme-muted group-hover:text-brand transition-colors"/>
            </Link>
          </ScrollAnimate>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 items-stretch">
            {promoProducts.map((product, index) => {
              const hasHoverImage = product.images && product.images.length > 0;
              const hoverImageUrl = hasHoverImage ? product.images[0] : null;
              const activePrice = product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price);
              const installmentPrice = (activePrice / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

              return (
                <ScrollAnimate key={product.id} animation="fade-up" delay={index * 100} className="h-full">
                  <div className="h-full bg-transparent border border-theme-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-2 duration-500">
                    <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-transparent overflow-hidden border-b border-theme-border shrink-0 transition-colors duration-300 group/img">
                      {product.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={`absolute inset-0 p-3 md:p-6 object-contain w-full h-full transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-md ${
                              hasHoverImage ? 'group-hover/img:opacity-0' : ''
                            }`}
                          />
                          {hasHoverImage && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={hoverImageUrl!}
                              alt={`${product.name} alternate view`}
                              className="absolute inset-0 p-3 md:p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-500 drop-shadow-md"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-muted text-[10px] md:text-sm font-black tracking-widest uppercase text-center absolute inset-0">No Image</div>
                      )}

                      <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none transform group-hover/img:scale-105 transition-transform duration-300">
                        {product.stock > 0 ? (
                          <span className="bg-green-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">IN STOCK</span>
                        ) : (
                          <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">SOLD OUT</span>
                        )}
                        {product.onSale && (
                          <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider animate-pulse w-fit mt-0.5 md:mt-0">
                            PROMO
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 scale-90 md:scale-100 origin-top-right transform group-hover/img:scale-110 transition-transform duration-300">
                        <WishlistButton
                          productId={product.id}
                          initialIsWishlisted={wishlistedIds.includes(product.id)}
                        />
                      </div>
                    </Link>

                    <div className="p-3 md:p-5 flex flex-col flex-grow z-10 bg-transparent">
                      <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                        <h3 className="font-bold text-[11px] md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide">{product.name}</h3>
                      </Link>

                      <div className="flex items-center gap-1.5 mb-3 md:mb-4">
                        <div className="flex text-theme-muted/50 text-[10px] tracking-widest">★★★★★</div>
                        <span className="text-[8px] md:text-[9px] text-theme-muted">(reviews)</span>
                      </div>

                      <div className="mt-auto flex flex-col gap-3">
                        <div className="flex items-end justify-between gap-2">
                          <div className="font-black text-sm md:text-lg text-theme-main transition-colors duration-300 leading-none">
                            <span className="text-[9px] md:text-[10px] text-theme-muted block mb-1 tracking-widest uppercase font-bold">LKR</span>
                            {product.onSale && product.salePrice ? (
                              <div className="flex flex-col">
                                <span className="text-[9px] md:text-xs text-theme-muted line-through leading-none mb-0.5">{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                <span className="text-red-500">{Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ) : (
                              <span>{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            )}
                          </div>

                          <div className="shrink-0 mt-1 md:mt-0 transition-transform hover:scale-105 duration-300">
                            <AddToCartButton product={{
                              id: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: activePrice,
                              imageUrl: product.imageUrl,
                            }} isCard={true} />
                          </div>
                        </div>

                        <div className="text-[8px] md:text-[10px] text-theme-muted font-medium mt-1">
                          or 3 X <span className="font-bold text-theme-main">LKR {installmentPrice}</span> with <span className="text-[#a855f7] font-black italic tracking-wider">KOKO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollAnimate>
              );
            })}
          </div>

          {promoProducts.length === 0 && (
            <div className="text-center py-12 mb-8 border border-theme-border border-dashed rounded-2xl bg-surface-card/30">
              <p className="text-theme-muted font-medium">No active promotions at the moment. Check back soon!</p>
            </div>
          )}

        </div>
      </section>

      {/* --- DYNAMIC SHOP BY CATEGORY CAROUSELS & ALTERNATING LAYOUTS --- */}
      {activeCarousels.map((carousel, index) => {
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

        if (carousel.imageUrl) {
          return (
            <ScrollAnimate key={carousel.id} animation="fade-up" delay={50}>
              <BannerCategoryLayout
                id={carousel.id}
                index={index}
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
            </ScrollAnimate>
          );
        } else {
          if (!carousel.category) return null;
          return (
            <ScrollAnimate key={carousel.id} animation="fade-up" delay={50} className="pt-8 px-4 container mx-auto max-w-7xl">
              <ProductCarousel
                title={carousel.title}
                categorySlug={carousel.category.slug}
                products={productDetails}
                wishlistedIds={wishlistedIds}
              />
            </ScrollAnimate>
          );
        }
      })}

      {/* --- CUSTOMER EXPERIENCES CAROUSEL --- */}
      <ScrollAnimate animation="fade-up" delay={100}>
        <CustomerExperiencesCarousel images={experienceImages} />
      </ScrollAnimate>

      {/* --- PRE-FOOTER TRUST BANNER & SECURE CHECKOUT BADGES --- */}
      <section className="bg-surface-card/30 border-y border-theme-border py-12 md:py-16 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* 4-Column Trust Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-theme-border">
            <ScrollAnimate animation="fade-up" delay={0} className="flex flex-col items-center text-center px-4 hover:-translate-y-1 transition-transform duration-300 cursor-default group">
              <Truck className="w-8 h-8 text-brand mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h4 className="text-theme-main font-black uppercase tracking-widest text-xs md:text-sm mb-2 group-hover:text-brand transition-colors">Islandwide Shipping</h4>
              <p className="text-theme-muted text-[10px] md:text-xs font-medium">Enjoy free delivery on every order above 100,000.</p>
            </ScrollAnimate>

            <ScrollAnimate animation="fade-up" delay={100} className="flex flex-col items-center text-center px-4 hover:-translate-y-1 transition-transform duration-300 cursor-default group">
              <RefreshCcw className="w-8 h-8 text-brand mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h4 className="text-theme-main font-black uppercase tracking-widest text-xs md:text-sm mb-2 group-hover:text-brand transition-colors">Money-Back Guarantee</h4>
              <p className="text-theme-muted text-[10px] md:text-xs font-medium">3-day money back guarantee.</p>
            </ScrollAnimate>

            <ScrollAnimate animation="fade-up" delay={200} className="flex flex-col items-center text-center px-4 hover:-translate-y-1 transition-transform duration-300 cursor-default group">
              <ShieldCheck className="w-8 h-8 text-brand mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h4 className="text-theme-main font-black uppercase tracking-widest text-xs md:text-sm mb-2 group-hover:text-brand transition-colors">Secure Payments</h4>
              <p className="text-theme-muted text-[10px] md:text-xs font-medium">Secure checkout verified</p>
            </ScrollAnimate>

            <ScrollAnimate animation="fade-up" delay={300} className="flex flex-col items-center text-center px-4 hover:-translate-y-1 transition-transform duration-300 cursor-default group">
              <HeadphonesIcon className="w-8 h-8 text-brand mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h4 className="text-theme-main font-black uppercase tracking-widest text-xs md:text-sm mb-2 group-hover:text-brand transition-colors">Online Customer Service</h4>
              <p className="text-theme-muted text-[10px] md:text-xs font-medium">Call our expert <span className="text-red-500 font-bold hover:text-brand transition-colors">(076) - 7629227</span></p>
            </ScrollAnimate>
          </div>

          {/* Secure Checkout Badges */}
          <ScrollAnimate animation="fade-in" delay={400} className="mt-12 md:mt-16 flex flex-col items-center gap-6 border-t border-theme-border/50 pt-10">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-theme-main flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-green-500 animate-pulse" /> Guarantee Safe & Secure Checkout
            </span>

            <div className="flex flex-wrap justify-center gap-3 opacity-70 hover:opacity-100 transition-opacity duration-500">
              <div className="bg-white w-12 h-8 md:w-14 md:h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                <span className="text-[#1A1F71] font-black text-base md:text-lg italic tracking-tighter">VISA</span>
              </div>
              <div className="bg-white w-12 h-8 md:w-14 md:h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-[#EB001B] rounded-full absolute -ml-3 mix-blend-multiply"></div>
                <div className="w-4 h-4 md:w-5 md:h-5 bg-[#F79E1B] rounded-full absolute ml-3 mix-blend-multiply"></div>
              </div>
              <div className="bg-white w-12 h-8 md:w-14 md:h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 p-1.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="bg-[#27AEE3] w-full h-full rounded-sm flex flex-col items-center justify-center leading-[0.85]">
                  <span className="text-white text-[4px] md:text-[5px] font-bold tracking-wider">AMERICAN</span>
                  <span className="text-white text-[4px] md:text-[5px] font-bold tracking-wider">EXPRESS</span>
                </div>
              </div>
              <div className="bg-white w-12 h-8 md:w-14 md:h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-[1.5px] border-[#004A97] rounded-full flex items-center justify-center mb-0.5">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 border-l-[1.5px] border-b-[1.5px] border-[#004A97] rounded-full"></div>
                  </div>
                  <span className="text-[#004A97] text-[3px] md:text-[4px] font-bold uppercase leading-none tracking-wider">Diners Club</span>
                </div>
              </div>
              <div className="bg-white w-12 h-8 md:w-14 md:h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                <span className="text-black font-black text-[7px] md:text-[8px] tracking-tighter flex items-center">
                  DISC<div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#E55C20] rounded-full mx-[1px]"></div>VER
                </span>
              </div>
              <div className="bg-white w-12 h-8 md:w-14 md:h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 overflow-hidden relative hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="flex gap-[1px] w-[120%] h-full absolute">
                  <div className="w-1/3 h-full bg-[#E60012] skew-x-[-15deg] -ml-2"></div>
                  <div className="w-1/3 h-full bg-[#004E97] skew-x-[-15deg]"></div>
                  <div className="w-1/3 h-full bg-[#007C85] skew-x-[-15deg] mr-2"></div>
                </div>
                <span className="text-white font-bold text-[6px] md:text-[7px] z-10 drop-shadow-md">UnionPay</span>
              </div>
            </div>
          </ScrollAnimate>

        </div>
      </section>

    </div>
  );
}

// --- UPGRADED: Alternating Banner Layout matching your reference image ---
function BannerCategoryLayout({
  id, index, title, categorySlug, banner, products, wishlistedIds
}: {
  id: number,
  index: number,
  title: string,
  categorySlug: string,
  banner: { imageUrl: string | null, imageTitle: string | null, imageSubtitle: string | null, imageButtonText: string | null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[],
  wishlistedIds: string[]
}) {
  const isBannerRight = index % 2 === 0;
  const displayProducts = products.slice(0, 3);

  return (
    <section key={id} className="py-16 px-4 container mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8 md:mb-10 border-b border-theme-border pb-4 transition-colors duration-300 group">
        <h2 className="text-xl md:text-3xl font-black text-theme-main tracking-[0.2em] uppercase transition-colors group-hover:text-brand">
          {title}
        </h2>
        <Link href={`/products?category=${categorySlug}`} className="text-theme-muted hover:text-brand font-black text-[10px] md:text-xs uppercase tracking-[0.1em] flex items-center gap-1.5 transition-all duration-300 hover:translate-x-1">
          View All <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-theme-muted group-hover:text-brand transition-colors"/>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 items-stretch">

        {/* Promotional Banner Card */}
        <ScrollAnimate animation="fade-in" delay={0} className={`col-span-2 lg:col-span-1 min-h-[250px] lg:min-h-full rounded-xl md:rounded-2xl border border-theme-border transition-all duration-500 relative overflow-hidden flex items-end p-6 md:p-8 flex-col shadow-2xl hover:shadow-[0_0_30px_rgba(var(--color-brand),0.2)] hover:-translate-y-1 group/banner order-1 ${isBannerRight ? 'lg:order-last' : 'lg:order-first'}`}>
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl || "placeholder.jpg"} alt={banner.imageTitle || title} className="w-full h-full object-cover transform transition-transform duration-[8s] group-hover/banner:scale-110"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>
          </div>
          <div className="relative z-10 text-center w-full mt-auto space-y-2 md:space-y-4">
            <span className="text-[10px] font-black text-brand uppercase tracking-[0.2em] animate-pulse">{banner.imageSubtitle || "Epic Deals"}</span>
            <h1 className="text-2xl md:text-4xl font-black mb-1 leading-tight text-white uppercase">{banner.imageTitle || title}</h1>
            <Button asChild className="w-full bg-theme-main text-black hover:bg-brand transition-all duration-300 font-bold uppercase tracking-widest text-[10px] md:text-[11px] py-4 md:py-6 rounded-xl hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.02] active:scale-95">
              <Link href={`/products?category=${categorySlug}`}>{banner.imageButtonText || "Shop Now"}</Link>
            </Button>
          </div>
        </ScrollAnimate>

        {/* Exact 3 Product Cards - UPGRADED */}
        {displayProducts.map((product, pIndex) => {
          const hasHoverImage = product.images && product.images.length > 0;
          const hoverImageUrl = hasHoverImage ? product.images[0] : null;
          const activePrice = product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price);
          const installmentPrice = (activePrice / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

          return (
            <ScrollAnimate key={product.id} animation="fade-up" delay={(pIndex + 1) * 100} className="order-2 h-full">
              <div className="h-full bg-transparent border border-theme-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-2 duration-500">
                <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-transparent overflow-hidden border-b border-theme-border shrink-0 transition-colors duration-300 group/img">
                  {product.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`absolute inset-0 p-3 md:p-6 object-contain w-full h-full transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-md ${
                          hasHoverImage ? 'group-hover/img:opacity-0' : ''
                        }`}
                      />
                      {hasHoverImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={hoverImageUrl!}
                          alt={`${product.name} alternate view`}
                          className="absolute inset-0 p-3 md:p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-500 drop-shadow-md"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-theme-muted text-[10px] md:text-sm font-black tracking-widest uppercase text-center absolute inset-0">No Image</div>
                  )}

                  <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none transform group-hover/img:scale-105 transition-transform duration-300">
                    {product.stock > 0 ? (
                      <span className="bg-green-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">IN STOCK</span>
                    ) : (
                      <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">SOLD OUT</span>
                    )}
                    {product.onSale && (
                      <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider animate-pulse w-fit mt-0.5 md:mt-0">
                        PROMO
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 scale-90 md:scale-100 origin-top-right transform group-hover/img:scale-110 transition-transform duration-300">
                    <WishlistButton
                      productId={product.id}
                      initialIsWishlisted={wishlistedIds.includes(product.id)}
                    />
                  </div>
                </Link>

                <div className="p-3 md:p-5 flex flex-col flex-grow z-10 bg-transparent">
                  {product.category && (
                    <span className="text-[8px] md:text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1 md:mb-2 truncate">
                      {product.category.name}
                    </span>
                  )}

                  <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                    <h3 className="font-bold text-[11px] md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide">{product.name}</h3>
                  </Link>

                  <div className="flex items-center gap-1.5 mb-3 md:mb-4">
                    <div className="flex text-theme-muted/50 text-[10px] tracking-widest">★★★★★</div>
                    <span className="text-[8px] md:text-[9px] text-theme-muted">(reviews)</span>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="font-black text-sm md:text-lg text-theme-main transition-colors duration-300 leading-none">
                        <span className="text-[9px] md:text-[10px] text-theme-muted block mb-1 tracking-widest uppercase font-bold">LKR</span>
                        {product.onSale && product.salePrice ? (
                          <div className="flex flex-col">
                            <span className="text-[9px] md:text-xs text-theme-muted line-through leading-none mb-0.5">{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="text-red-500">{Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ) : (
                          <span>{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>

                      <div className="shrink-0 mt-1 md:mt-0 transition-transform hover:scale-105 duration-300">
                        <AddToCartButton product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: activePrice,
                          imageUrl: product.imageUrl,
                        }} isCard={true} />
                      </div>
                    </div>

                    <div className="text-[8px] md:text-[10px] text-theme-muted font-medium mt-1">
                      or 3 X <span className="font-bold text-theme-main">LKR {installmentPrice}</span> with <span className="text-[#a855f7] font-black italic tracking-wider">KOKO</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          );
        })}
      </div>
    </section>
  );
}