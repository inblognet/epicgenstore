// app/profile/loading.tsx
export default function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-surface-bg py-8 md:py-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Page Title Skeleton */}
        <div className="h-8 md:h-10 w-48 bg-surface-card/80 rounded animate-pulse mb-8 md:mb-10"></div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

          {/* --- LEFT SIDEBAR SKELETON --- */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 md:sticky md:top-[100px]">

            {/* User Avatar & Info Box */}
            <div className="bg-surface-card/30 border border-theme-border rounded-2xl p-6 flex flex-col items-center justify-center animate-pulse">
              <div className="w-24 h-24 rounded-full bg-surface-card/80 mb-4 border-4 border-surface-bg"></div>
              <div className="h-4 w-32 bg-surface-card/80 rounded mb-2"></div>
              <div className="h-3 w-40 bg-surface-card/50 rounded"></div>
            </div>

            {/* Navigation Menu List */}
            <div className="bg-surface-card/30 border border-theme-border rounded-2xl p-4 flex flex-col gap-2 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full bg-surface-card/80 rounded-lg"
                  style={{ animationDelay: `${i * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>

          {/* --- MAIN CONTENT AREA SKELETON --- */}
          <main className="flex-1 w-full flex flex-col gap-6 md:gap-8">

            {/* Section 1: e.g., Account Info Form */}
            <div className="bg-surface-card/30 border border-theme-border rounded-2xl p-6 md:p-8 animate-pulse" style={{ animationDelay: '200ms' }}>
              <div className="h-6 w-40 bg-surface-card/80 rounded mb-8"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 w-24 bg-surface-card/50 rounded"></div>
                    <div className="h-12 w-full bg-surface-card/80 rounded-xl border border-theme-border/50"></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 h-12 w-32 bg-surface-card/80 rounded-xl"></div>
            </div>

            {/* Section 2: e.g., Recent Orders or Address Book */}
            <div className="bg-surface-card/30 border border-theme-border rounded-2xl p-6 md:p-8 animate-pulse" style={{ animationDelay: '400ms' }}>
              <div className="h-6 w-48 bg-surface-card/80 rounded mb-6"></div>

              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 w-full bg-surface-card/50 rounded-xl border border-theme-border/50 flex items-center p-4 justify-between"
                  >
                    <div className="flex flex-col gap-2 w-1/3">
                       <div className="h-4 w-full bg-surface-card/80 rounded"></div>
                       <div className="h-3 w-2/3 bg-surface-card/80 rounded"></div>
                    </div>
                    <div className="h-8 w-24 bg-surface-card/80 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>

      </div>
    </div>
  );
}