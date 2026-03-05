// app/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// FIXED: Removed the unused 'Package' icon
import { User, MapPin, CheckCircle, Save, Camera, Clock, CreditCard, Truck } from "lucide-react";
import { OrderSlipUpload } from "@/components/client/order-slip-upload";

export default async function UserProfilePage() {
  // 1. Authenticate the User
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/");
  }

  // 2. Fetch user profile, orders, and store settings
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
        }
      }
    }),
    prisma.siteSetting.findUnique({ where: { id: 1 } })
  ]);

  if (!user) redirect("/");

  // "Active" orders are anything still in progress
  const activeStatuses = ["PENDING", "PAID", "SHIPPED"];
  const activeOrders = user.orders.filter(o => activeStatuses.includes(o.status));

  // "History" is anything finalized (CANCELLED)
  const completedOrders = user.orders.filter(o => !activeStatuses.includes(o.status));

  // 3. Profile Update Action
  async function updateProfile(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (!currentSession?.user?.email) throw new Error("Unauthorized");

    await prisma.user.update({
      where: { email: currentSession.user.email },
      data: {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        postalCode: formData.get("postalCode") as string,
        image: formData.get("image") as string,
      }
    });

    revalidatePath("/profile");
  }

  return (
    <div className="min-h-screen bg-surface-bg text-zinc-50 py-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase italic">My Account</h1>
          <p className="text-brand font-bold uppercase text-[10px] tracking-[0.3em] transition-colors duration-300">
            {settings?.storeName || "Epic"} Customer Profile
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">

          {/* --- PROFILE EDITOR (LEFT) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand transition-colors duration-300" />

              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative w-24 h-24 rounded-full bg-surface-bg border-4 border-brand/20 overflow-hidden mb-4 shadow-lg shadow-brand/15 transition-all duration-300">
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 m-auto mt-6 text-zinc-800" />
                  )}
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">{user.name}</h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{user.email}</p>
              </div>

              <form action={updateProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                       <Camera className="w-3 h-3 text-brand transition-colors duration-300" /> Avatar URL
                    </label>
                    <input type="url" name="image" defaultValue={user.image || ""} placeholder="https://..." className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand focus:outline-none transition-all duration-300" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Full Name</label>
                    <input type="text" name="name" defaultValue={user.name || ""} required className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand focus:outline-none transition-all duration-300" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Contact Number</label>
                    <input type="tel" name="phone" defaultValue={user.phone || ""} placeholder="+94 77 123 4567" className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-white focus:border-brand focus:outline-none transition-all duration-300" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">District</label>
                    {/* cSpell ignores the local cities naturally, it only warns in the IDE */}
                    <select name="city" defaultValue={user.city || ""} className="w-full bg-surface-bg border border-zinc-800/50 rounded-xl px-3 py-3 text-xs text-white focus:border-brand focus:outline-none transition-all cursor-pointer duration-300">
                      <option value="">Select District...</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      <option value="Other">Other (Island Wide)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand hover:bg-brand-hover text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand/20 uppercase text-xs tracking-widest mt-4 duration-300">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </form>
            </div>
          </div>

          {/* --- ORDER TRACKING (RIGHT) --- */}
          <div className="lg:col-span-8 space-y-10">

            {/* Active Orders */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 text-brand transition-colors duration-300">
                <Clock className="w-4 h-4 animate-pulse" /> Active Shipments
              </h3>
              {activeOrders.length === 0 ? (
                <div className="bg-surface-card/30 border border-zinc-800/50 border-dashed rounded-3xl p-16 text-center text-zinc-500 font-black uppercase text-[10px] tracking-widest transition-colors duration-300">
                  No active orders currently processing
                </div>
              ) : (
                <div className="grid gap-6">
                  {activeOrders.map(order => {
                    const stepStatus = { PENDING: 1, PAID: 2, SHIPPED: 3 };
                    const currentStep = stepStatus[order.status as keyof typeof stepStatus] || 1;

                    return (
                      <div key={order.id} className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 flex flex-col justify-between gap-8 hover:border-brand/50 transition-all shadow-2xl group duration-300">

                        <div className="flex flex-col lg:flex-row justify-between gap-8">

                          <div className="space-y-2 lg:w-1/3">
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Order Reference</p>
                            <p className="text-zinc-400 font-mono text-[11px] mb-4">#{order.id.toUpperCase()}</p>
                            <p className="text-3xl font-black text-white tracking-tighter">LKR {Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.1em] pt-2">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                          </div>

                          {/* VISUAL ORDER STATUS TRACKER */}
                          <div className="flex-1 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-zinc-800/50 pt-8 lg:pt-0 lg:pl-10 relative">
                            <div className="flex justify-between items-center relative z-10">

                              {/* Step 1: Pending */}
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${currentStep >= 1 ? 'bg-brand border-brand text-black shadow-[0_0_15px_rgba(var(--color-brand),0.4)]' : 'bg-surface-bg border-zinc-700 text-zinc-600'}`}>
                                  <Clock className="w-4 h-4" />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${currentStep >= 1 ? 'text-brand' : 'text-zinc-600'}`}>Pending</span>
                              </div>

                              {/* Progress Line 1 */}
                              <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ${currentStep >= 2 ? 'bg-brand' : 'bg-zinc-800'}`} />

                              {/* Step 2: Paid */}
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${currentStep >= 2 ? 'bg-brand border-brand text-black shadow-[0_0_15px_rgba(var(--color-brand),0.4)]' : 'bg-surface-bg border-zinc-700 text-zinc-600'}`}>
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${currentStep >= 2 ? 'text-brand' : 'text-zinc-600'}`}>Paid</span>
                              </div>

                              {/* Progress Line 2 */}
                              <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ${currentStep >= 3 ? 'bg-brand' : 'bg-zinc-800'}`} />

                              {/* Step 3: Shipped */}
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${currentStep >= 3 ? 'bg-brand border-brand text-black shadow-[0_0_15px_rgba(var(--color-brand),0.4)]' : 'bg-surface-bg border-zinc-700 text-zinc-600'}`}>
                                  <Truck className="w-4 h-4" />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${currentStep >= 3 ? 'text-brand' : 'text-zinc-600'}`}>Shipped</span>
                              </div>

                            </div>
                          </div>
                        </div>

                        {/* Slip Upload (Only show if still pending/unpaid) */}
                        {order.status === "PENDING" && (
                          <div className="flex flex-col justify-center border-t border-zinc-800/50 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                              <MapPin className="w-3 h-3 text-brand transition-colors duration-300" />
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Slip Upload Required</p>
                            </div>
                            <OrderSlipUpload orderId={order.id} currentSlip={order.bankSlipUrl} />
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Purchases */}
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-700">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 text-zinc-500">
                <CheckCircle className="w-4 h-4" /> Finalized Transactions
              </h3>
              <div className="bg-surface-card border border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm transition-colors duration-300">
                {completedOrders.length === 0 ? (
                  <div className="p-12 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">No previous history available</div>
                ) : (
                  <div className="divide-y divide-zinc-800/50">
                    {completedOrders.map(order => (
                      <div key={order.id} className="p-6 flex justify-between items-center bg-surface-card hover:bg-surface-bg transition-colors duration-300">
                        <div>
                          <p className="text-[10px] text-zinc-500 font-black mb-1 uppercase tracking-widest">REF: {order.id.slice(0,8)}</p>
                          <p className="font-black text-zinc-300 text-sm">LKR {Number(order.total).toLocaleString()}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          {/* FIXED: Removed DELIVERED and rely on Prisma schema statuses (e.g., CANCELLED) */}
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border ${
                            order.status === 'CANCELLED' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                            'text-brand border-brand/20 bg-brand/5'
                          }`}>
                            {order.status}
                          </span>
                          <p className="text-[9px] text-zinc-600 font-black uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}