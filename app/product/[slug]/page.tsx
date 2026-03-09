// app/product/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/client/add-to-cart-button";
import { ProductImageGallery } from "@/components/client/product-image-gallery";
import Link from "next/link";
import { ArrowLeft, Tag, Truck, RefreshCcw, HeadphonesIcon, Building, Banknote, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { WishlistButton } from "@/components/client/wishlist-button";

export default async function ProductDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      categories: true,
      tags: true,
    }
  });

  if (!product) {
    return notFound();
  }

  const categoryIds = product.categories.map(c => c.id);
  const relatedProducts = categoryIds.length > 0 ? await prisma.product.findMany({
    where: {
      categories: {
        some: {
          id: { in: categoryIds }
        }
      },
      id: { not: product.id }, // Exclude the current product
    },
    take: 4,
    orderBy: { createdAt: "desc" }
  }) : [];

  let wishlistedIds: string[] = [];
  if (session?.user?.id) {
    const userWishlist = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    });
    wishlistedIds = userWishlist.map((w) => w.productId);
  }

  const primaryCategory = product.categories.length > 0 ? product.categories[0] : null;

  // Pricing calculations for the UI mockups
  const activePrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
  const cardPrice = activePrice * 1.03; // 3% markup for card UI
  const kokoTotal = activePrice * 1.076; // Koko markup
  const kokoInstallment = kokoTotal / 3;
  const pay2yInstallment = activePrice / 4;

  return (
    <div className="min-h-screen bg-surface-bg text-theme-main py-8 md:py-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">

        <Link href="/products" className="inline-flex items-center text-xs md:text-sm font-bold text-theme-muted hover:text-brand mb-8 md:mb-10 transition-colors uppercase tracking-wider duration-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>

        {/* --- MAIN PRODUCT DETAILS (TOP SECTION) --- */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">

          {/* Left: Image Gallery */}
          <div className="lg:sticky lg:top-[100px]">
            <ProductImageGallery
              mainImage={product.imageUrl}
              subImages={product.images}
            />
          </div>

          {/* Right: Product Info & Actions */}
          <div className="flex flex-col pt-2">

            {primaryCategory && (
              <Link
                href={`/products?category=${primaryCategory.slug}`}
                className="inline-flex items-center w-fit px-3 py-1.5 rounded bg-surface-card border border-theme-border text-theme-main text-[10px] font-black uppercase tracking-widest mb-4 hover:bg-surface-bg hover:border-brand/50 hover:text-brand transition-all duration-300"
              >
                <Tag className="w-3 h-3 mr-2" />
                {primaryCategory.name}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-theme-main transition-colors duration-300 mb-4 uppercase">
              {product.name}
            </h1>

            {/* Tags Badges */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 text-[9px] font-black uppercase tracking-widest transition-colors duration-300"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Reviews Mockup */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-theme-muted/50 text-xs tracking-widest">★★★★★</div>
              <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">5 Reviews</span>
              <span className={`ml-4 text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase ${
                product.stock > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {product.stock > 0 ? `In Stock` : 'Sold Out'}
              </span>
            </div>

            {/* Price Block */}
            <div className="flex flex-col mb-6">
              <span className="text-3xl md:text-4xl font-black text-theme-main transition-colors duration-300">
                LKR {activePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              {product.salePrice && (
                <span className="text-sm text-theme-muted line-through font-bold mt-1">
                  LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              )}
              <span className="text-[11px] text-theme-muted font-medium mt-2">
                or up to 4 X LKR {pay2yInstallment.toLocaleString('en-US', { minimumFractionDigits: 2 })} with <span className="font-black text-[#00AEEF] italic">Pay2y-Not available</span>
              </span>
            </div>

            {/* --- UPGRADED: 4-COLUMN PAYMENT OPTIONS GRID --- */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4">
              <div className="border border-theme-border rounded-lg p-2 md:p-3 flex flex-col items-center justify-center gap-1.5 bg-surface-card hover:border-brand transition-colors cursor-pointer">
                <Banknote className="w-5 h-5 text-theme-muted" />
                <span className="text-[8px] md:text-[9px] font-black text-theme-main text-center leading-none">LKR {activePrice.toLocaleString()}</span>
              </div>
              <div className="border border-theme-border rounded-lg p-2 md:p-3 flex flex-col items-center justify-center gap-1.5 bg-surface-card hover:border-brand transition-colors cursor-pointer">
                <Building className="w-5 h-5 text-theme-muted" />
                <span className="text-[8px] md:text-[9px] font-black text-theme-main text-center leading-none">LKR {activePrice.toLocaleString()}</span>
              </div>
              <div className="border-2 border-[#1434CB]/30 bg-[#1434CB]/5 rounded-lg p-2 md:p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer relative">
                <span className="text-[#1434CB] font-black italic tracking-tighter text-sm leading-none">VISA</span>
                <span className="text-[8px] md:text-[9px] font-black text-theme-main text-center leading-none mt-1">LKR {cardPrice.toLocaleString()}</span>
              </div>
              <div className="border-2 border-[#27AEE3]/30 bg-[#27AEE3]/5 rounded-lg p-2 md:p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer relative">
                <span className="text-[#27AEE3] font-black tracking-widest text-[10px] leading-none">AMEX</span>
                <span className="text-[8px] md:text-[9px] font-black text-theme-main text-center leading-none mt-1">LKR {cardPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* KOKO Box */}
            <div className="border-2 border-[#a855f7]/50 bg-[#a855f7]/5 rounded-xl p-5 flex flex-col items-center justify-center text-center mb-8 hover:bg-[#a855f7]/10 transition-colors cursor-pointer">
               <span className="text-[#a855f7] font-black text-xl tracking-[0.2em] italic mb-1">KOKO</span>
               <span className="text-theme-main font-black text-sm">LKR {kokoTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
               <span className="text-theme-muted text-[10px] font-bold mt-1 tracking-widest">or 3 x LKR {kokoInstallment.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>

            {/* Add to Cart Actions */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: activePrice,
                    imageUrl: product.imageUrl,
                  }}
                  initialIsWishlisted={wishlistedIds.includes(product.id)}
                />
              </div>
            </div>

            {/* Feature Icons */}
            <div className="flex items-center justify-between py-6 border-y border-theme-border mb-8">
               <div className="flex flex-col items-center gap-2 text-center w-1/3">
                  <Truck className="w-6 h-6 text-theme-main" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-theme-muted leading-tight">1 Days Instant<br/>Delivery</span>
               </div>
               <div className="flex flex-col items-center gap-2 text-center w-1/3 border-x border-theme-border">
                  <RefreshCcw className="w-6 h-6 text-theme-main" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-theme-muted leading-tight">3 Days Return<br/>Period</span>
               </div>
               <div className="flex flex-col items-center gap-2 text-center w-1/3">
                  <HeadphonesIcon className="w-6 h-6 text-theme-main" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-theme-muted leading-tight">24H Customer<br/>Support</span>
               </div>
            </div>

            {/* --- UPGRADED: Safe Checkout Badges (Pure CSS Icons) --- */}
            <div className="flex flex-col items-center gap-4">
               <span className="text-xs font-black uppercase tracking-widest text-theme-main flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-green-500" /> Guarantee Safe & Secure Checkout
               </span>
               <div className="flex flex-wrap justify-center gap-2">

                  {/* VISA */}
                  <div className="bg-white w-14 h-9 rounded flex items-center justify-center shadow-md border border-zinc-200">
                    <span className="text-[#1A1F71] font-black text-lg italic tracking-tighter">VISA</span>
                  </div>

                  {/* MASTERCARD */}
                  <div className="bg-white w-14 h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 relative overflow-hidden">
                    <div className="w-5 h-5 bg-[#EB001B] rounded-full absolute -ml-3 mix-blend-multiply"></div>
                    <div className="w-5 h-5 bg-[#F79E1B] rounded-full absolute ml-3 mix-blend-multiply"></div>
                  </div>

                  {/* UNIONPAY */}
                  <div className="bg-white w-14 h-9 rounded flex items-center justify-center shadow-md border border-zinc-200 overflow-hidden relative">
                    <div className="flex gap-[1px] w-[120%] h-full absolute">
                      <div className="w-1/3 h-full bg-[#E60012] skew-x-[-15deg] -ml-2"></div>
                      <div className="w-1/3 h-full bg-[#004E97] skew-x-[-15deg]"></div>
                      <div className="w-1/3 h-full bg-[#007C85] skew-x-[-15deg] mr-2"></div>
                    </div>
                    <span className="text-white font-bold text-[7px] z-10 drop-shadow-md">UnionPay</span>
                  </div>

               </div>
            </div>

          </div>
        </div>

        {/* --- DESCRIPTION TAB SECTION (BOTTOM) --- */}
        <div className="pt-16 pb-16 border-t border-theme-border">
          <div className="flex justify-center mb-10">
             <div className="flex items-center gap-8 border-b-2 border-theme-border w-full md:w-auto justify-center md:px-12">
                <span className="text-theme-main font-black uppercase tracking-widest text-sm md:text-base pb-4 border-b-4 border-red-500 -mb-[3px]">
                  Description
                </span>
             </div>
          </div>

          <div className="max-w-4xl mx-auto bg-surface-card/30 p-8 rounded-2xl border border-theme-border">
             {product.description ? (
                <div className="text-theme-muted leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                   {product.description}
                </div>
             ) : (
                <p className="text-center text-theme-muted italic">No detailed description provided for this item.</p>
             )}
          </div>
        </div>

        {/* --- RELATED PRODUCTS SECTION (TALL TRANSPARENT CARDS) --- */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-theme-border transition-colors duration-300">
            <div className="mb-10 text-center">
              <h2 className="text-2xl md:text-3xl font-black mb-2 text-theme-main transition-colors duration-300 uppercase tracking-widest">Related Products</h2>
              <p className="text-theme-muted text-xs md:text-sm font-bold uppercase tracking-widest transition-colors duration-300">You might also be interested in</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 items-stretch">
              {relatedProducts.map((related) => {
                const hasHoverImage = related.images && related.images.length > 0;
                const hoverImageUrl = hasHoverImage ? related.images[0] : null;
                const relatedActivePrice = related.salePrice ? Number(related.salePrice) : Number(related.price);
                const relatedInstallment = (relatedActivePrice / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

                return (
                  <div key={related.id} className="h-full bg-transparent border border-theme-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-xl duration-300">

                    <Link href={`/product/${related.slug}`} className="block relative aspect-[4/5] bg-transparent overflow-hidden border-b border-theme-border shrink-0 transition-colors duration-300 group/img">
                      {related.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={related.imageUrl}
                            alt={related.name}
                            className={`absolute inset-0 p-3 md:p-6 object-contain w-full h-full transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-md ${
                              hasHoverImage ? 'group-hover/img:opacity-0' : ''
                            }`}
                          />
                          {hasHoverImage && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={hoverImageUrl!}
                              alt={`${related.name} alternate view`}
                              className="absolute inset-0 p-3 md:p-6 object-contain w-full h-full transform scale-95 opacity-0 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-500 drop-shadow-md"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-muted text-[10px] md:text-sm font-black tracking-widest uppercase text-center absolute inset-0">No Image</div>
                      )}

                      <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none">
                        {related.stock > 0 ? (
                          <span className="bg-green-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">IN STOCK</span>
                        ) : (
                          <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider w-fit">SOLD OUT</span>
                        )}
                        {related.salePrice && (
                          <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md tracking-wider animate-pulse w-fit mt-0.5 md:mt-0">
                            PROMO
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 scale-90 md:scale-100 origin-top-right">
                        <WishlistButton
                          productId={related.id}
                          initialIsWishlisted={wishlistedIds.includes(related.id)}
                        />
                      </div>
                    </Link>

                    <div className="p-3 md:p-5 flex flex-col flex-grow z-10 bg-transparent">
                      <Link href={`/product/${related.slug}`} className="hover:text-brand transition-colors duration-300">
                        <h3 className="font-bold text-[11px] md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide">{related.name}</h3>
                      </Link>

                      <div className="flex items-center gap-1.5 mb-3 md:mb-4">
                        <div className="flex text-theme-muted/50 text-[10px] tracking-widest">★★★★★</div>
                        <span className="text-[8px] md:text-[9px] text-theme-muted">(reviews)</span>
                      </div>

                      <div className="mt-auto flex flex-col gap-3">
                        <div className="flex items-end justify-between gap-2">
                          <div className="font-black text-sm md:text-lg text-theme-main transition-colors duration-300 leading-none">
                            <span className="text-[9px] md:text-[10px] text-theme-muted block mb-1 tracking-widest uppercase font-bold">LKR</span>
                            {related.salePrice ? (
                              <div className="flex flex-col">
                                <span className="text-[9px] md:text-xs text-theme-muted line-through leading-none mb-0.5">{Number(related.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                <span className="text-red-500">{Number(related.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ) : (
                              <span>{Number(related.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            )}
                          </div>

                          <div className="shrink-0 mt-1 md:mt-0">
                            <AddToCartButton product={{
                              id: related.id,
                              name: related.name,
                              slug: related.slug,
                              price: relatedActivePrice,
                              imageUrl: related.imageUrl,
                            }} isCard={true} />
                          </div>
                        </div>

                        <div className="text-[8px] md:text-[10px] text-theme-muted font-medium mt-1">
                          or 3 X <span className="font-bold text-theme-main">LKR {relatedInstallment}</span> with <span className="text-[#a855f7] font-black italic tracking-wider">KOKO</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}