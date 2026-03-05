// app/(admin)/admin/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/admin-nav";
import { DollarSign, Package, ShoppingBag, Users, ArrowUpRight, Activity } from "lucide-react";
import { RevenueChart, OrdersChart } from "@/components/admin/dashboard-charts";
import Link from "next/link";

// Force dynamic so the dashboard always shows live data
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  // --- 1. FETCH AGGREGATE STATS ---
  const [totalProducts, totalOrders, totalUsers, revenueCalc] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      // Optional: Only count paid/completed orders for revenue
      // where: { status: { in: ["PAID", "SHIPPED"] } }
    })
  ]);

  const totalRevenue = revenueCalc._sum.total || 0;

  // --- 2. FETCH CHART DATA (Last 7 Days) ---
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentOrdersData = await prisma.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' }
  });

  // Group data by day for the charts
  const chartDataMap = new Map();

  // Initialize the last 7 days with 0 to ensure no empty gaps in the chart
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // FIXED: Removed the invalid 'short: numeric' property
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    chartDataMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
  }

  // Populate actual data
  recentOrdersData.forEach(order => {
    // FIXED: Removed the invalid 'short: numeric' property
    const dateStr = order.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (chartDataMap.has(dateStr)) {
      const existing = chartDataMap.get(dateStr);
      existing.revenue += Number(order.total);
      existing.orders += 1;
    }
  });

  const chartData = Array.from(chartDataMap.values());

  // --- 3. FETCH RECENT ACTIVITY (Latest 5 Orders) ---
  const recentOrdersList = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans pb-24 transition-colors duration-300">
      <AdminNav />

      <div className="flex items-center gap-3 mb-8">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <Activity className="h-8 w-8 text-brand transition-colors duration-300" />
        <h1 className="text-3xl font-black uppercase tracking-tight italic">Dashboard Overview</h1>
      </div>

      {/* --- KPI STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
        <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 shadow-lg relative overflow-hidden group transition-colors duration-300">
          {/* REPLACED: group-hover:text-yellow-500/10 -> group-hover:text-brand/10 */}
          <div className="absolute -right-6 -top-6 text-zinc-800/50 group-hover:text-brand/10 transition-colors duration-500">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              {/* REPLACED: text-yellow-500 -> text-brand */}
              <DollarSign className="w-4 h-4 text-brand transition-colors duration-300" /> Total Revenue
            </p>
            <h3 className="text-3xl font-black text-white">
              <span className="text-lg text-zinc-500 mr-1">LKR</span>
              {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 shadow-lg relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-6 -top-6 text-zinc-800/50 group-hover:text-brand/10 transition-colors duration-500">
            <ShoppingBag className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand transition-colors duration-300" /> Total Orders
            </p>
            <h3 className="text-3xl font-black text-white">{totalOrders.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 shadow-lg relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-6 -top-6 text-zinc-800/50 group-hover:text-brand/10 transition-colors duration-500">
            <Package className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand transition-colors duration-300" /> Active Products
            </p>
            <h3 className="text-3xl font-black text-white">{totalProducts.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 shadow-lg relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-6 -top-6 text-zinc-800/50 group-hover:text-brand/10 transition-colors duration-500">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand transition-colors duration-300" /> Registered Users
            </p>
            <h3 className="text-3xl font-black text-white">{totalUsers.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-6 shadow-xl transition-colors duration-300">
          <h3 className="text-white font-bold text-lg mb-1">Revenue Overview</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-6">Last 7 Days</p>
          <RevenueChart data={chartData} />
        </div>

        <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-6 shadow-xl transition-colors duration-300">
          <h3 className="text-white font-bold text-lg mb-1">Order Volume</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-6">Last 7 Days</p>
          <OrdersChart data={chartData} />
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-6 shadow-xl overflow-hidden transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-bold text-lg">Recent Orders</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">Latest transactions</p>
          </div>
          {/* REPLACED: text-yellow-500 hover:text-yellow-400 -> text-brand hover:text-brand-hover */}
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover uppercase tracking-widest transition-colors duration-300">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-300">
            <thead className="text-xs text-zinc-500 uppercase font-black border-b border-zinc-800/50 tracking-wider">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {recentOrdersList.map((order) => (
                <tr key={order.id} className="hover:bg-surface-bg/50 transition-colors duration-300">
                  <td className="px-4 py-4 font-mono text-xs text-zinc-400">
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-brand hover:underline transition-colors duration-300">
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-zinc-200">{order.user.name}</p>
                    <p className="text-xs text-zinc-500">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-4 text-xs">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border transition-colors duration-300 ${
                      order.status === 'PAID' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      order.status === 'SHIPPED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      // REPLACED: yellow -> brand
                      'bg-brand/10 text-brand border-brand/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-black text-zinc-100">
                    LKR {Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {recentOrdersList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}