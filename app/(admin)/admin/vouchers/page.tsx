// app/(admin)/admin/vouchers/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link"; // Added for navigation
import { Ticket, Plus, Trash2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav"; // Import the dynamic nav

export default async function AdminVouchersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createVoucher(formData: FormData) {
    "use server";
    const code = formData.get("code") as string;
    const type = formData.get("type") as "PERCENTAGE" | "FIXED";
    const value = parseFloat(formData.get("value") as string);
    const expiry = formData.get("expiry") as string;

    await prisma.voucher.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: type,
        discountValue: value,
        expiryDate: expiry ? new Date(expiry) : null,
      },
    });

    revalidatePath("/admin/vouchers");
  }

  async function deleteVoucher(id: string) {
    "use server";
    await prisma.voucher.delete({ where: { id } });
    revalidatePath("/admin/vouchers");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl text-zinc-50 font-sans transition-colors duration-300">

      {/* --- ADMIN SUB-NAVIGATION --- */}
      <AdminNav />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {/* REPLACED: text-yellow-500 -> text-brand */}
          <Ticket className="h-8 w-8 text-brand transition-colors duration-300" />
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">Voucher Management</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Voucher Form */}
        <div className="lg:col-span-1">
          {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
          <div className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 sticky top-24 shadow-xl transition-colors duration-300">
            {/* REPLACED: text-yellow-500 -> text-brand */}
            <h2 className="text-lg font-bold text-brand mb-6 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors duration-300">
              <Plus className="w-4 h-4" /> Generate New Code
            </h2>
            <form action={createVoucher} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Voucher Code</label>
                {/* REPLACED: bg-zinc-950 border-zinc-800 focus:border-yellow-500 -> bg-surface-bg border-zinc-800/50 focus:border-brand */}
                <input type="text" name="code" required placeholder="e.g. EPICSTORE20" className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white focus:border-brand outline-none uppercase transition-all duration-300" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type</label>
                  {/* REPLACED: bg-zinc-950 border-zinc-800 focus:border-yellow-500 -> bg-surface-bg border-zinc-800/50 focus:border-brand */}
                  <select name="type" className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-3 py-3 text-sm text-white focus:border-brand outline-none transition-all duration-300 cursor-pointer">
                    <option value="PERCENTAGE">Percent (%)</option>
                    <option value="FIXED">Fixed (LKR)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Value</label>
                  {/* REPLACED: bg-zinc-950 border-zinc-800 focus:border-yellow-500 -> bg-surface-bg border-zinc-800/50 focus:border-brand */}
                  <input type="number" name="value" required placeholder="10" className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white focus:border-brand outline-none transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-1 pb-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Expiry Date (Optional)</label>
                {/* REPLACED: bg-zinc-950 border-zinc-800 focus:border-yellow-500 -> bg-surface-bg border-zinc-800/50 focus:border-brand */}
                <input type="date" name="expiry" className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white focus:border-brand outline-none transition-all duration-300" />
              </div>

              {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/10 -> bg-brand hover:bg-brand-hover shadow-brand/10 */}
              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-black font-black py-6 rounded-xl shadow-lg shadow-brand/10 transition-all duration-300 active:scale-95">
                Create Voucher
              </Button>
            </form>
          </div>
        </div>

        {/* Existing Vouchers List */}
        <div className="lg:col-span-2 space-y-4">
          {vouchers.length === 0 ? (
            // REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50
            <div className="bg-surface-card border-2 border-dashed border-zinc-800/50 rounded-2xl p-12 text-center transition-colors duration-300">
              <Ticket className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">No active vouchers found</p>
            </div>
          ) : (
            vouchers.map((v) => (
              // REPLACED: bg-zinc-900 border-zinc-800 hover:border-zinc-700 -> bg-surface-card border-zinc-800/50 hover:border-zinc-600
              <div key={v.id} className="bg-surface-card border border-zinc-800/50 rounded-2xl p-5 flex items-center justify-between group hover:border-zinc-600 transition-all duration-300 shadow-sm">
                <div className="flex items-center gap-6">
                  {/* REPLACED: bg-zinc-950 border-zinc-800 text-yellow-500 -> bg-surface-bg border-zinc-800/50 text-brand */}
                  <div className="w-14 h-14 rounded-xl bg-surface-bg border border-zinc-800/50 flex items-center justify-center text-brand transition-colors duration-300">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-lg tracking-wider text-white uppercase">{v.code}</h3>
                      {v.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-zinc-500 uppercase bg-zinc-500/10 px-2 py-0.5 rounded border border-zinc-800">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      {/* REPLACED: text-yellow-500 -> text-brand */}
                      <span>Value: <span className="text-brand transition-colors duration-300">{v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `LKR ${Number(v.discountValue).toLocaleString()}`}</span></span>
                      {v.expiryDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Exp: {new Date(v.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <form action={async () => { "use server"; await deleteVoucher(v.id); }}>
                  <button className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}