// app/(admin)/admin/orders/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Eye, Tag } from "lucide-react";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { AdminNav } from "@/components/admin/admin-nav"; // Import the dynamic nav

export default async function AdminOrdersPage() {
  // 1. SECURE THE ROUTE
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // 2. Fetch all orders
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      _count: {
        select: { items: true }
      }
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans transition-colors duration-300">

      {/* UNIFIED ADMIN NAVIGATION */}
      <AdminNav />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {/* REPLACED: text-yellow-500 -> text-brand */}
          <Package className="h-8 w-8 text-brand transition-colors duration-300" />
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">Order Management</h1>
        </div>
        {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
        <div className="bg-surface-card border border-zinc-800/50 px-4 py-2 rounded-xl text-xs font-black text-zinc-400 uppercase tracking-widest shadow-xl transition-colors duration-300">
          Total Records: {orders.length}
        </div>
      </div>

      {/* ORDERS TABLE */}
      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <div className="bg-surface-card border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-300">
            {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 */}
            <thead className="bg-surface-bg border-b border-zinc-800/50 text-zinc-500 uppercase text-[10px] font-black tracking-widest transition-colors duration-300">
              <tr>
                <th className="px-6 py-5">Order Reference</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Inventory</th>
                <th className="px-6 py-5">Total Amount</th>
                <th className="px-6 py-5">State</th>
                <th className="px-6 py-5">Created</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors group">

                  <td className="px-6 py-4">
                    {/* REPLACED: group-hover:text-yellow-500/50 -> group-hover:text-brand/50 */}
                    <div className="font-mono text-[10px] text-zinc-500 group-hover:text-brand/50 transition-colors duration-300">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-100 uppercase text-xs">{order.user.name || "Guest"}</div>
                    <div className="text-[10px] text-zinc-500 font-medium lowercase tracking-tight">{order.user.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-zinc-800 text-zinc-500 text-[10px] font-black px-2 py-1 rounded-lg border border-zinc-700">
                      {order._count.items} {order._count.items === 1 ? 'UNIT' : 'UNITS'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-black text-white text-xs">
                      LKR {Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    {order.voucherCode && (
                      <div className="flex items-center gap-1 text-green-500 text-[9px] font-black uppercase mt-1">
                        <Tag className="w-2.5 h-2.5" /> {order.voucherCode}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border transition-colors duration-300 ${
                      order.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      // REPLACED: bg-yellow-500/10 text-yellow-500 border-yellow-500/20 -> bg-brand/10 text-brand border-brand/20
                      order.status === 'PENDING' ? 'bg-brand/10 text-brand border-brand/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-zinc-500 text-[10px] font-black uppercase">
                    {new Date(order.createdAt).toLocaleDateString('en-GB')}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        // REPLACED: hover:bg-yellow-500 -> hover:bg-brand
                        className="p-2 bg-zinc-800 hover:bg-brand text-zinc-400 hover:text-black rounded-xl transition-all duration-300 active:scale-95 shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* FIXED: Using Client Component to handle deletion and confirm dialog */}
                      <DeleteOrderButton orderId={order.id} />
                    </div>
                  </td>

                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Package className="h-12 w-12 text-white" />
                      <p className="text-white font-black uppercase text-xs tracking-[0.2em]">No deployments found</p>
                    </div>
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