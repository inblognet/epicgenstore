// app/products/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ProductFilters } from "@/components/client/product-filters";
import { AddToCartButton } from "@/components/client/add-to-cart-button";
import { WishlistButton } from "@/components/client/wishlist-button";
import { SortDropdown } from "@/components/client/sort-dropdown";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  // FIXED: Updated to query the 'categories' array using 'some'
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

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      // FIXED: Changed to plural 'categories'
      include: { categories: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } }
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

  return (
    <div className="min-h-screen bg-surface-bg text-theme-main py-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12 border-b border-theme-border pb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : isOnSale ? "Promotions & Deals" : "Our Inventory"}
          </h1>
          <p className="text-theme-muted text-lg">
            {isOnSale ? "Epic discounts on enterprise-grade hardware." : "Premium computer hardware tailored for your needs."}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <ProductFilters categories={categories} />

          <main className="flex-1 w-full">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-surface-card/50 p-4 rounded-xl border border-theme-border transition-colors duration-300">

              <span className="text-sm text-theme-muted font-bold">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-surface-bg border border-theme-border rounded-2xl overflow-hidden hover:border-brand transition-all group flex flex-col shadow-lg duration-300">
                  <div className="relative aspect-[4/3] bg-surface-card/50 overflow-hidden border-b border-theme-border group/img">
                    <Link href={`/product/${product.slug}`} className="absolute inset-0 p-6 flex items-center justify-center z-0">
                      {product.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain transform group-hover/img:scale-110 transition-transform duration-500 drop-shadow-2xl" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-muted text-sm font-black tracking-widest uppercase">No Image</div>
                      )}
                    </Link>

                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      <span className={`text-[10px] font-black px-2 py-1 rounded shadow-md tracking-wider ${product.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {product.stock > 0 ? 'IN STOCK' : 'SOLD OUT'}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 z-20">
                      <WishlistButton
                        productId={product.id}
                        initialIsWishlisted={wishlistedIds.includes(product.id)}
                      />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow z-10 bg-surface-bg">
                    {/* FIXED: Display the first category in the array */}
                    {product.categories && product.categories.length > 0 && (
                      <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-2">
                        {product.categories[0].name}
                      </span>
                    )}

                    <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-3 text-theme-main">{product.name}</h3>
                    </Link>

                    <div className="mt-auto pt-4 flex flex-col gap-4">
                      <div className="font-black text-xl">
                        {product.onSale && product.salePrice ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-theme-muted line-through">Rs. {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="text-red-500">Rs. {Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ) : (
                          <span className="text-brand">Rs. {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>

                      <AddToCartButton product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.onSale && product.salePrice ? Number(product.salePrice) : Number(product.price),
                        imageUrl: product.imageUrl,
                      }} isCard={true} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}