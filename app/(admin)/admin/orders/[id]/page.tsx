// app/(admin)/admin/orders/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, FileText, CheckCircle2, ExternalLink } from "lucide-react";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const resolvedParams = await params;
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  });

  if (!order) return notFound();

  // Action to Update Status via Select
  async function updateStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as OrderStatus;
    await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { status },
    });
    revalidatePath(`/admin/orders/${resolvedParams.id}`);
  }

  // Quick Action: Approve Bank Slip (One-Click)
  async function approvePayment() {
    "use server";
    await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { status: "PAID" },
    });
    revalidatePath(`/admin/orders/${resolvedParams.id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl text-zinc-50 font-sans">
      <Link href="/admin/orders" className="inline-flex items-center text-xs font-black text-zinc-500 hover:text-yellow-500 mb-8 uppercase tracking-widest transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Package className="h-6 w-6 text-yellow-500" />
             <h1 className="text-2xl font-black uppercase tracking-tight">Order Details</h1>
          </div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-tighter">Reference ID: {order.id}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Update Status:</span>
          <form action={updateStatus} className="flex gap-2">
            <select
              name="status"
              defaultValue={order.status}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-yellow-500 outline-none cursor-pointer"
            >
              {Object.values(OrderStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
              Save
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* --- BANK SLIP DISPLAY SECTION --- */}
          {order.bankSlipUrl ? (
            <div className="bg-zinc-900 border-2 border-blue-500/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-blue-500/10 px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                  <FileText className="w-4 h-4" /> Bank Slip Received
                </div>
                {order.status !== "PAID" && (
                  <form action={approvePayment}>
                    <button className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Payment
                    </button>
                  </form>
                )}
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
                {/* Image Container with Hover Effects */}
                <div className="w-full md:w-64 aspect-[3/4] bg-black rounded-xl border border-zinc-800 overflow-hidden relative group cursor-zoom-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.bankSlipUrl}
                    alt="Uploaded Bank Slip"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  <a
                    href={order.bankSlipUrl}
                    target="_blank"
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="flex flex-col items-center gap-2">
                       <ExternalLink className="text-white w-6 h-6" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Open Full Size</span>
                    </div>
                  </a>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h3 className="font-black text-zinc-100 uppercase text-xs tracking-widest text-blue-400">Payment Verification</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    The customer has uploaded a local file via UploadThing. Please cross-reference this slip with your bank statement for <strong>LKR {Number(order.total).toLocaleString()}</strong>.
                  </p>
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 inline-block">
                     <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Upload Date</p>
                     <p className="text-xs text-zinc-200 font-mono">{new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
               <FileText className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Awaiting Bank Slip Upload from Customer</p>
            </div>
          )}

          {/* Items Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800 font-black text-[10px] uppercase tracking-widest text-zinc-400">Hardware Inventory</div>
            <div className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-[10px] uppercase font-black border-b border-zinc-800">
                    <th className="text-left pb-4">Item Name</th>
                    <th className="text-center pb-4">Qty</th>
                    <th className="text-right pb-4">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 font-bold text-zinc-100 uppercase text-xs tracking-tighter">{item.product.name}</td>
                      <td className="py-4 text-center font-bold text-zinc-400 text-xs">x{item.quantity}</td>
                      <td className="py-4 text-right font-black text-white text-xs">LKR {(item.quantity * Number(item.price)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-sm">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Total Receivable</span>
                <span className="text-4xl font-black text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">LKR {Number(order.total).toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Right Sidebar: Customer Profile */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full -mr-8 -mt-8" />
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <User className="w-3 h-3 text-yellow-500" /> Client Intelligence
            </h2>
            <div className="space-y-6 text-xs font-medium">
              <div>
                <div className="text-zinc-100 uppercase font-black text-sm tracking-tight">{order.user.name || "Guest User"}</div>
                <div className="text-zinc-500 lowercase mt-1 font-mono">{order.user.email}</div>
                <div className="text-yellow-500 font-bold mt-3 tracking-widest text-[10px]">{order.user.phone || "PHONE UNKNOWN"}</div>
              </div>
              <div className="pt-6 border-t border-zinc-800">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Destination</div>
                <p className="text-zinc-400 leading-relaxed font-bold">
                  {order.user.address || "Address not provided"}<br />
                  <span className="text-zinc-500">{order.user.city} {order.user.postalCode}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}