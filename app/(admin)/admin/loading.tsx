// app/(admin)/admin/loading.tsx
export default function AdminDashboardLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full font-sans transition-colors duration-300">

      {/* --- DASHBOARD HEADER SKELETON --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="h-8 w-48 bg-surface-card rounded-lg animate-pulse mb-2 border border-theme-border/50"></div>
          <div className="h-4 w-64 bg-surface-card rounded-md animate-pulse border border-theme-border/50"></div>
        </div>
        <div className="h-10 w-32 bg-surface-card rounded-lg animate-pulse border border-theme-border/50"></div>
      </div>

      {/* --- TOP METRICS CARDS (Grid of 4) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-card/40 border border-theme-border rounded-2xl p-6 flex flex-col gap-4 animate-pulse shadow-sm"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 bg-surface-card/80 rounded"></div>
              <div className="h-10 w-10 rounded-xl bg-surface-card border border-theme-border/50"></div>
            </div>
            <div className="h-8 w-32 bg-surface-card/80 rounded-lg mt-2"></div>
            <div className="h-3 w-40 bg-surface-card/50 rounded mt-auto"></div>
          </div>
        ))}
      </div>

      {/* --- MIDDLE SECTION: CHARTS & ACTIVITY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">

        {/* Main Chart Area (Spans 2 columns) */}
        <div
          className="lg:col-span-2 bg-surface-card/40 border border-theme-border rounded-2xl p-6 h-[400px] flex flex-col animate-pulse shadow-sm"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="h-5 w-48 bg-surface-card/80 rounded"></div>
            <div className="h-8 w-24 bg-surface-card/80 rounded-lg"></div>
          </div>
          {/* Mock Chart Area */}
          <div className="flex-1 bg-surface-card/50 rounded-xl w-full border border-theme-border/30 flex items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-surface-bg/50 animate-ping"></div>
          </div>
        </div>

        {/* Recent Orders / Activity Side Panel */}
        <div
          className="bg-surface-card/40 border border-theme-border rounded-2xl p-6 h-[400px] flex flex-col gap-4 animate-pulse shadow-sm"
          style={{ animationDelay: '500ms' }}
        >
          <div className="h-5 w-40 bg-surface-card/80 rounded mb-2"></div>
          <div className="flex flex-col gap-5 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-theme-border/30 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-card/80"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-24 bg-surface-card/80 rounded"></div>
                    <div className="h-2 w-16 bg-surface-card/50 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-12 bg-surface-card/80 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- BOTTOM DATA TABLE SKELETON --- */}
      <div
        className="bg-surface-card/40 border border-theme-border rounded-2xl p-6 animate-pulse shadow-sm"
        style={{ animationDelay: '600ms' }}
      >
        <div className="h-5 w-40 bg-surface-card/80 rounded mb-6"></div>

        {/* Table Header */}
        <div className="flex justify-between mb-4 pb-4 border-b border-theme-border/50">
          <div className="h-3 w-16 bg-surface-card/80 rounded"></div>
          <div className="h-3 w-32 bg-surface-card/80 rounded"></div>
          <div className="h-3 w-20 bg-surface-card/80 rounded hidden md:block"></div>
          <div className="h-3 w-24 bg-surface-card/80 rounded"></div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-6 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-16 bg-surface-card/50 rounded"></div>
              <div className="flex items-center gap-3 w-40">
                 <div className="h-8 w-8 rounded bg-surface-card/50"></div>
                 <div className="h-3 w-24 bg-surface-card/50 rounded"></div>
              </div>
              <div className="h-5 w-20 bg-surface-card/80 rounded-full hidden md:block"></div>
              <div className="h-4 w-24 bg-surface-card/80 rounded"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}