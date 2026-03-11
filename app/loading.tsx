// app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-surface-bg pt-16 pb-24 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* --- HEADER SKELETON --- */}
        <div className="text-center mb-8 md:mb-12 border-b border-theme-border pb-6 md:pb-8 flex flex-col items-center justify-center space-y-4">
          <div className="h-10 md:h-12 w-3/4 max-w-md bg-surface-card rounded-xl animate-pulse border border-theme-border/50"></div>
          <div className="h-4 md:h-5 w-1/2 max-w-xs bg-surface-card rounded-md animate-pulse border border-theme-border/50 delay-75"></div>
        </div>

        {/* --- CAROUSEL / BANNER SKELETON --- */}
        <div className="w-full h-[30vh] md:h-[400px] bg-surface-card rounded-2xl mb-16 animate-pulse border border-theme-border/50 relative overflow-hidden flex items-center justify-center">
           {/* Faint pulsing logo effect in the center of the banner */}
           <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-surface-bg/50 animate-ping"></div>
        </div>

        {/* --- PRODUCT GRID SKELETON --- */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-surface-card rounded-lg animate-pulse border border-theme-border/50"></div>
          <div className="h-4 w-20 bg-surface-card rounded-md animate-pulse border border-theme-border/50"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 items-stretch">
          {/* Create 8 empty skeleton cards */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] bg-transparent border border-theme-border rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col animate-pulse shadow-sm"
              style={{ animationDelay: `${i * 100}ms` }} // Stagger the pulsing effect!
            >
              {/* Image Placeholder */}
              <div className="flex-grow bg-surface-card rounded-lg mb-4 w-full border border-theme-border/30"></div>

              {/* Category Placeholder */}
              <div className="h-2 w-1/3 bg-surface-card rounded mb-2"></div>

              {/* Title Placeholder */}
              <div className="h-3 md:h-4 w-3/4 bg-surface-card rounded mb-3"></div>

              {/* Stars Placeholder */}
              <div className="h-2 w-1/2 bg-surface-card rounded mb-auto"></div>

              {/* Price & Button Placeholder */}
              <div className="flex items-end justify-between mt-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <div className="h-2 w-8 bg-surface-card rounded"></div>
                  <div className="h-4 w-24 bg-surface-card rounded"></div>
                </div>
                <div className="h-8 w-8 md:h-10 md:w-10 bg-surface-card rounded-lg border border-theme-border/50"></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}