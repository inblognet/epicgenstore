// app/product/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/client/add-to-cart-button";
import { ProductImageGallery } from "@/components/client/product-image-gallery";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
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
      // FIXED: Changed to plural 'categories'
      categories: true,
      tags: true,
    }
  });

  if (!product) {
    return notFound();
  }

  // FIXED: Updated related products query to handle the categories array
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

  // Helper variable to grab the primary category for UI display
  const primaryCategory = product.categories.length > 0 ? product.categories[0] : null;

  return (
    <div className="min-h-screen bg-surface-bg text-theme-main py-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">

        <Link href="/products" className="inline-flex items-center text-sm font-bold text-theme-muted hover:text-brand mb-10 transition-colors uppercase tracking-wider duration-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>

        {/* --- MAIN PRODUCT DETAILS --- */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">

          <ProductImageGallery
            mainImage={product.imageUrl}
            subImages={product.images}
          />

          <div className="flex flex-col pt-2 md:pt-8">

            {/* FIXED: Using primaryCategory instead of product.category */}
            {primaryCategory && (
              <Link
                href={`/products?category=${primaryCategory.slug}`}
                className="inline-flex items-center w-fit px-3 py-1.5 rounded-full bg-surface-card border border-theme-border text-theme-main text-xs font-black uppercase tracking-widest mb-6 hover:bg-surface-bg hover:border-brand/50 hover:text-brand transition-all duration-300"
              >
                <Tag className="w-3 h-3 mr-2" />
                {primaryCategory.name}
              </Link>
            )}

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-theme-main transition-colors duration-300 mb-4">
              {product.name}
            </h1>

            {/* --- PRODUCT TAGS BADGES --- */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-1 rounded bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 mb-8">
              {product.salePrice ? (
                <>
                  <span className="text-xl text-theme-muted line-through font-bold transition-colors duration-300">
                    LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-4xl font-black text-red-500">
                    LKR {Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-black text-brand transition-colors duration-300">
                  LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <div className="mb-10">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                product.stock > 0
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {product.stock > 0 ? `IN STOCK (${product.stock} Available)` : 'SOLD OUT'}
              </span>
            </div>

            <div className="mb-12">
              <h3 className="text-lg font-bold text-theme-main mb-4 border-b border-theme-border pb-3 transition-colors duration-300">Product Overview</h3>
              {product.description ? (
                <p className="text-theme-muted leading-relaxed whitespace-pre-wrap text-sm md:text-base transition-colors duration-300">
                  {product.description}
                </p>
              ) : (
                <p className="text-theme-muted/70 italic text-sm transition-colors duration-300">No detailed description provided for this item.</p>
              )}
            </div>

            {/* Add to Cart Section */}
            <div className="mt-auto pt-8 border-t border-theme-border transition-colors duration-300">
              <div className="w-full lg:w-4/5">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.salePrice ? Number(product.salePrice) : Number(product.price),
                    imageUrl: product.imageUrl,
                  }}
                  initialIsWishlisted={wishlistedIds.includes(product.id)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* --- RELATED PRODUCTS SECTION --- */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-theme-border transition-colors duration-300">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3 text-theme-main transition-colors duration-300">Related Products</h2>
              <p className="text-theme-muted font-medium transition-colors duration-300">You might also be interested in these products</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <div key={related.id} className="bg-surface-card border border-theme-border rounded-xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-lg duration-300">

                  {/* Related Product Image */}
                  <div className="relative aspect-square bg-surface-bg overflow-hidden border-b border-theme-border transition-colors duration-300 group/img">
                    <Link href={`/product/${related.slug}`} className="absolute inset-0 p-6 flex items-center justify-center z-0">
                      {related.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={related.imageUrl}
                          alt={related.name}
                          className="w-full h-full object-contain transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-xl"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-muted text-sm font-medium uppercase tracking-widest transition-colors duration-300">No Image</div>
                      )}
                    </Link>

                    {/* Stock Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
                      {related.stock > 0 ? (
                        <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-md tracking-wider">IN STOCK</span>
                      ) : (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-md tracking-wider">SOLD OUT</span>
                      )}

                      {related.salePrice && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md tracking-wider animate-pulse w-fit">
                          PROMO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Related Product Info */}
                  <div className="p-5 flex flex-col flex-grow z-10 bg-surface-bg transition-colors duration-300">
                    <Link href={`/product/${related.slug}`} className="hover:text-brand transition-colors duration-300">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-3 text-theme-main transition-colors duration-300">{related.name}</h3>
                    </Link>

                    <div className="mt-auto pt-4 flex flex-col gap-4">
                      <div className="font-black text-lg">
                        {related.salePrice ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-theme-muted line-through transition-colors duration-300">LKR {Number(related.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="text-red-500">LKR {Number(related.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ) : (
                          <span className="text-brand transition-colors duration-300">LKR {Number(related.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>

                      <AddToCartButton product={{
                        id: related.id,
                        name: related.name,
                        slug: related.slug,
                        price: related.salePrice ? Number(related.salePrice) : Number(related.price),
                        imageUrl: related.imageUrl,
                      }}
                      initialIsWishlisted={wishlistedIds.includes(related.id)}
                      isCard={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}