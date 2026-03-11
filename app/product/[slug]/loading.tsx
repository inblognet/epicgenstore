// app/product/[slug]/loading.tsx
export default function ProductLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-surface-bg py-8 md:py-12 font-sans transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Back Button Skeleton */}
        <div className="h-4 w-32 bg-surface-card/80 rounded animate-pulse mb-8 md:mb-10"></div>

        {/* --- MAIN PRODUCT DETAILS SKELETON --- */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">

          {/* Left: Image Gallery Skeleton */}
          <div className="w-full aspect-square bg-surface-card/50 rounded-2xl animate-pulse border border-theme-border/30 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full bg-surface-bg/50 animate-ping"></div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="flex flex-col pt-2">

            {/* Category Tag */}
            <div className="h-6 w-24 bg-surface-card/80 rounded mb-4 animate-pulse"></div>

            {/* Product Title (2 lines) */}
            <div className="h-10 md:h-12 w-full bg-surface-card/80 rounded-lg animate-pulse mb-2"></div>
            <div className="h-10 md:h-12 w-2/3 bg-surface-card/80 rounded-lg animate-pulse mb-6" style={{ animationDelay: '100ms' }}></div>

            {/* Stars & Review count */}
            <div className="flex gap-4 mb-6">
              <div className="h-4 w-32 bg-surface-card/80 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="h-4 w-16 bg-surface-card/80 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
            </div>

            {/* Price */}
            <div className="h-12 w-1/2 bg-surface-card/80 rounded-lg animate-pulse mb-2" style={{ animationDelay: '250ms' }}></div>
            <div className="h-3 w-1/3 bg-surface-card/80 rounded animate-pulse mb-8" style={{ animationDelay: '300ms' }}></div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-surface-card/50 rounded-lg animate-pulse border border-theme-border/30" style={{ animationDelay: `${350 + (i * 50)}ms` }}></div>
              ))}
            </div>

            {/* KOKO Banner */}
            <div className="h-24 w-full bg-surface-card/50 rounded-xl animate-pulse mb-8 border border-theme-border/30" style={{ animationDelay: '400ms' }}></div>

            {/* Add to Cart Button */}
            <div className="h-14 w-full bg-surface-card/80 rounded-xl animate-pulse mb-8" style={{ animationDelay: '450ms' }}></div>

            {/* Features (Truck, Returns, Support) */}
            <div className="flex items-center justify-between py-6 border-y border-theme-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-1/3">
                  <div className="h-6 w-6 rounded-full bg-surface-card/80 animate-pulse"></div>
                  <div className="h-2 w-16 bg-surface-card/80 rounded animate-pulse"></div>
                  <div className="h-2 w-12 bg-surface-card/80 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* --- DESCRIPTION SKELETON --- */}
        <div className="pt-10 pb-16 border-t border-theme-border flex flex-col items-center">
          <div className="h-6 w-32 bg-surface-card/80 rounded animate-pulse mb-10"></div>
          <div className="w-full max-w-4xl space-y-3">
            <div className="h-3 w-full bg-surface-card/80 rounded animate-pulse"></div>
            <div className="h-3 w-full bg-surface-card/80 rounded animate-pulse delay-75"></div>
            <div className="h-3 w-3/4 bg-surface-card/80 rounded animate-pulse delay-150"></div>
          </div>
        </div>

      </div>
    </div>
  );
}