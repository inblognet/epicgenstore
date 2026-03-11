// app/products/page.tsx
// cspell:ignore epicgenstore wishlisted KOKO
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Product, Category } from "@prisma/client";
import { ProductFilters } from "@/components/client/product-filters";
import { AddToCartButton } from "@/components/client/add-to-cart-button";
import { WishlistButton } from "@/components/client/wishlist-button";
import { SortDropdown } from "@/components/client/sort-dropdown";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { CategoryCarousel } from "@/components/client/category-carousel";

// 🚀 Import Animations & Redis
import { ScrollAnimate } from "@/components/client/scroll-animate";
import { redis } from "@/lib/redis";

// ==========================================
// 🛡️ STRICT TYPES
// ==========================================
type StoreProductList = Product & {
  images?: string[];
  categories?: Category[];
  reviews: { rating: number }[];
};

type SidebarCategory = Category & {
  _count: { products: number };
};
// ==========================================

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const resolvedParams = await searchParams;

  const categoryParam = typeof resolvedParams.category === "string" ? resolvedParams.category : "";
  const activeCategorySlugs = categoryParam ? categoryParam.split(",") : [];
  const tagParam = typeof resolvedParams.tag === "string" ? resolvedParams.tag : "";
  const selectedTagIds = tagParam ? tagParam.split(",") : [];
  const searchQuery = typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const isOnSale = resolvedParams.onSale === "true";
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;

  const sortParam = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest";

  const whereClause: Prisma.ProductWhereInput = {};
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (activeCategorySlugs.length > 0 && !activeCategorySlugs.includes("all")) {
    andConditions.push({ categories: { some: { slug: { in: activeCategorySlugs } } } });
  }

  if (selectedTagIds.length > 0) {
    selectedTagIds.forEach((tagSlug) => {
      andConditions.push({ tags: { some: { slug: tagSlug } } });
    });
  }

  if (searchQuery) {
    andConditions.push({
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ],
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: { gte?: number; lte?: number } = {};
    if (minPrice !== undefined) priceCondition.gte = minPrice;
    if (maxPrice !== undefined) priceCondition.lte = maxPrice;
    andConditions.push({ price: priceCondition });
  }

  if (isOnSale) andConditions.push({ onSale: true });

  if (andConditions.length > 0) whereClause.AND = andConditions;

  let orderByClause: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sortParam === "price_desc") orderByClause = { price: "desc" };
  else if (sortParam === "price_asc") orderByClause = { price: "asc" };

  // ==========================================
  // 🚀 REDIS CACHE FOR CATEGORY SIDEBAR
  // ==========================================
  const CATEGORY_CACHE_KEY = "epicgenstore:categories:filters";

  let categories = await redis.get<SidebarCategory[]>(CATEGORY_CACHE_KEY);

  if (!categories) {
    console.log("🐌 [REDIS] CACHE MISS: Fetching categories for sidebar...");
    const fetchedCategories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } }
    });

    categories = fetchedCategories as SidebarCategory[];
    await redis.set(CATEGORY_CACHE_KEY, categories, { ex: 3600 });
  } else {
    console.log("⚡ [REDIS] CACHE HIT: Loaded sidebar categories from memory");
  }
  // ==========================================

  // 🐌 ALWAYS FETCH PRODUCTS DYNAMICALLY based on the active user filters
  const fetchedProducts = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      categories: true,
      reviews: { select: { rating: true } }
    },
  });

  const products = fetchedProducts as StoreProductList[];

  let wishlistedIds: string[] = [];
  if (session?.user?.id) {
    const userWishlist = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    });
    wishlistedIds = userWishlist.map((w) => w.productId);
  }

  async function handleSortChange(formData: FormData) {
    "use server";
    const newSort = formData.get("sort") as string;
    const params = new URLSearchParams();

    if (categoryParam) params.set("category", categoryParam);
    if (tagParam) params.set("tag", tagParam);
    if (searchQuery) params.set("search", searchQuery);
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    if (isOnSale) params.set("onSale", "true");

    if (newSort && newSort !== "newest") params.set("sort", newSort);

    redirect(`/products?${params.toString()}`);
  }

  const carouselCategories = categories.filter((c: SidebarCategory) => c.imageUrl !== null);

  return (
    <div className="min-h-screen bg-surface-bg text-theme-main py-12 font-sans transition-colors duration-300">

      {/* HEADER SECTION */}
      <div className="container mx-auto px-4 max-w-7xl">
        <ScrollAnimate animation="fade-up" className="text-center mb-8 md:mb-12 border-b border-theme-border pb-6 md:pb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : isOnSale ? "Promotions & Deals" : "Our Inventory"}
          </h1>
          <p className="text-theme-muted text-sm md:text-lg">
            {isOnSale ? "Epic discounts on enterprise-grade hardware." : "Premium computer hardware tailored for your needs."}
          </p>
        </ScrollAnimate>
      </div>

      {/* --- CATEGORY CAROUSEL --- */}
      {carouselCategories.length > 0 && !searchQuery && (
        <ScrollAnimate animation="fade-in" delay={100} className="-mt-2">
          <CategoryCarousel categories={carouselCategories} />
        </ScrollAnimate>
      )}

      {/* FILTERS & PRODUCT GRID SECTION */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

          {/* EXACT OLD LAYOUT RESTORED: No extra wrappers! */}
          <ProductFilters categories={categories} />

          <main className="flex-1 w-full">
            <ScrollAnimate animation="fade-in" delay={200} className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-surface-card/50 p-4 rounded-xl border border-theme-border transition-colors duration-300">
              <span className="text-xs md:text-sm text-theme-muted font-bold">
                Showing {products.length} {products.length === 1 ? 'Result' : 'Results'}
              </span>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                   {isOnSale && (
                    <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black border border-red-500/20">
                      SALE ITEMS ONLY
                    </span>
                  )}
                  {activeCategorySlugs.map((cat) => (
                    <span key={cat} className="bg-surface-card text-theme-main px-3 py-1 rounded-full text-[10px] font-black border border-theme-border">
                      {cat}
                    </span>
                  ))}
                  {selectedTagIds.map((tag) => (
                    <span key={`tag-${tag}`} className="bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-black border border-brand/20">
                      TAG: {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>

                <form action={handleSortChange} className="ml-auto">
                  <SortDropdown initialSort={sortParam} />
                </form>
              </div>
            </ScrollAnimate>

            {products.length === 0 ? (
               <ScrollAnimate animation="fade-in" delay={300} className="text-center py-12 border border-theme-border border-dashed rounded-2xl bg-surface-card/30">
                 <p className="text-theme-muted font-medium transition-colors duration-300">No products match your current filters.</p>
               </ScrollAnimate>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 items-stretch">
                {products.map((product, index) => {
                  const hasHoverImage = product.images && product.images.length > 0;
                  const hoverImageUrl = hasHoverImage ? product.images[0] : null;
                  const activePrice = product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price);
                  const installmentPrice = (activePrice / 3).toLocaleString('en-US', { minimumFractionDigits: 2 });

                  const reviewCount = product.reviews.length;
                  const averageRating = reviewCount > 0
                    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
                    : 0;

                  return (
                    <ScrollAnimate key={product.id} animation="fade-up" delay={(index % 12) * 50} className="h-full">
                      <div className="h-full bg-transparent border border-theme-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand/50 transition-all group flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-2 duration-500">
                        <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-transparent border-b border-theme-border transition-colors duration-300 shrink-0 group/img">
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
                          {product.categories && product.categories.length > 0 && (
                            <span className="text-[8px] md:text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1 md:mb-2 truncate">
                              {product.categories[0].name}
                            </span>
                          )}

                          <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors duration-300">
                            <h3 className="font-bold text-[11px] md:text-sm leading-snug line-clamp-2 mb-2 text-theme-main uppercase tracking-wide">{product.name}</h3>
                          </Link>

                          <div className="flex items-center gap-1.5 mb-3 md:mb-4">
                            <div className="flex gap-[1px]">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                                    star <= Math.round(averageRating)
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "text-theme-border"
                                  } transition-colors duration-300`}
                                />
                              ))}
                            </div>
                            <span className="text-[8px] md:text-[9px] text-theme-muted uppercase font-bold tracking-widest">
                              ({reviewCount})
                            </span>
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
}