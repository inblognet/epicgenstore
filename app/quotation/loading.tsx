// app/quotation/loading.tsx
export default function QuotationLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-surface-bg py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-[1400px]">

        {/* --- EXACT HEADER MATCH --- */}
        <div className="mb-8 border-b border-theme-border pb-6 flex flex-col gap-3">
          <div className="h-10 md:h-12 w-64 md:w-96 bg-surface-card/80 rounded-lg animate-pulse"></div>
          <div className="h-4 md:h-5 w-72 md:w-[400px] bg-surface-card/50 rounded animate-pulse delay-75"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start relative">

          {/* --- LEFT SIDEBAR (Category Tabs Skeleton) --- */}
          <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 flex flex-col gap-3">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                // First item gets the yellow/brand border to mimic the active state
                className={`p-4 md:p-5 rounded-xl border ${i === 0 ? 'border-brand' : 'border-theme-border'} bg-surface-card/20 animate-pulse flex flex-col gap-2.5`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="h-4 w-3/4 bg-surface-card/80 rounded"></div>
                <div className="h-2.5 w-1/3 bg-surface-card/50 rounded"></div>
              </div>
            ))}
          </div>

          {/* --- RIGHT CONTENT AREA (Search, Products, Total Bar) --- */}
          <div className="flex-1 w-full flex flex-col min-h-[60vh] relative">

            {/* Search Bar Skeleton */}
            <div className="h-12 md:h-14 w-full bg-surface-card/30 rounded-xl border border-theme-border flex items-center px-4 animate-pulse mb-6">
              <div className="w-5 h-5 rounded-full border-2 border-theme-border/50 mr-3"></div>
              <div className="h-4 w-48 bg-surface-card/50 rounded"></div>
            </div>

            {/* Product List Skeleton */}
            <div className="flex flex-col gap-3 flex-grow pb-32">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface-card/10 border border-theme-border rounded-xl p-3 md:p-4 flex items-center justify-between animate-pulse"
                  style={{ animationDelay: `${200 + (i * 100)}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Small Product Image */}
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-card/80 rounded-lg border border-theme-border/30"></div>

                    {/* Text Details */}
                    <div className="flex flex-col gap-2">
                      <div className="h-4 md:h-5 w-48 md:w-64 bg-surface-card/80 rounded"></div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 md:h-4 w-16 md:w-20 bg-surface-card/80 rounded"></div>
                        <div className="h-3 md:h-4 w-16 md:w-24 bg-surface-card/40 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Empty Radio Circle */}
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-theme-border mr-2 md:mr-4"></div>
                </div>
              ))}
            </div>

            {/* Sticky Total Estimation Bar Skeleton */}
            <div className="fixed lg:absolute bottom-4 left-4 right-4 lg:left-auto lg:right-0 w-auto lg:w-full bg-surface-bg border border-brand rounded-xl p-4 md:p-5 flex flex-col sm:flex-row justify-between sm:items-end gap-4 animate-pulse shadow-2xl z-10">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-32 bg-surface-card/50 rounded"></div>
                <div className="h-8 md:h-10 w-40 bg-surface-card/80 rounded-lg"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 md:h-12 w-28 md:w-32 bg-surface-card/30 border border-theme-border rounded-lg"></div>
                <div className="h-10 md:h-12 w-28 md:w-32 bg-brand/50 rounded-lg"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}