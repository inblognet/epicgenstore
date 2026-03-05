// app/wishlist/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { WishlistButton } from "@/components/client/wishlist-button";

export const metadata = {
  title: "My Wishlist | EPIC STORE",
  description: "View your saved items.",
};

export default async function WishlistPage() {
  const session = await auth();

  // 1. Enterprise Rule: Must be logged in to view wishlist
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/wishlist");
  }

  // 2. Fetch the user's wishlist items securely from the database
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      // FIXED: Removed the nested 'images' include that caused the TypeScript error!
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-surface-bg transition-colors duration-300 py-12">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* PAGE HEADER */}
        <div className="flex items-center gap-3 mb-10 border-b border-theme-border pb-6">
          <div className="p-3 bg-brand/10 rounded-full">
            <Heart className="w-8 h-8 text-brand fill-brand" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-theme-main">My Wishlist</h1>
            <p className="text-theme-muted font-medium mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-card border border-theme-border rounded-3xl shadow-xl text-center px-4 transition-colors duration-300">
            <div className="w-24 h-24 bg-surface-bg rounded-full flex items-center justify-center mb-6 border border-theme-border shadow-inner">
              <Heart className="w-10 h-10 text-theme-muted" />
            </div>
            <h2 className="text-2xl font-black text-theme-main mb-3">Your wishlist is empty!</h2>
            <p className="text-theme-muted mb-8 max-w-md">
              Found something you like? Tap the heart icon on any product to save it here for later.
            </p>
            <Link
              href="/products"
              className="bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-brand/20 active:scale-95 flex items-center gap-2"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (

          /* WISHLIST GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const product = item.product as any;

              // FIXED: Uses optional chaining to grab whatever image field your database uses without crashing TS
              const imageUrl = product.images?.[0]?.url || product.imageUrl || product.images?.[0] || "/placeholder-image.png";

              return (
                <div
                  key={item.id}
                  className="bg-surface-card border border-theme-border rounded-2xl overflow-hidden shadow-lg group hover:border-brand transition-all duration-300 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-surface-bg overflow-hidden border-b border-theme-border">
                    <Link href={`/product/${product.slug}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* The Interactive Heart Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton
                        productId={product.id}
                        initialIsWishlisted={true}
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex flex-col flex-1">
                    <Link href={`/product/${product.slug}`} className="hover:text-brand transition-colors">
                      <h3 className="font-bold text-theme-main line-clamp-2 mb-2">{product.name}</h3>
                    </Link>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="font-black text-lg text-theme-main">
                        {/* Ensure price exists before calling toLocaleString */}
                        Rs. {product.price?.toLocaleString() || "0"}
                      </div>

                      <button className="w-10 h-10 rounded-full bg-surface-bg border border-theme-border flex items-center justify-center text-theme-main hover:bg-brand hover:text-black hover:border-brand transition-all duration-300 shadow-md">
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}