// app/(admin)/admin/inbox/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Inbox, Mail, Calendar, Phone, Trash2 } from "lucide-react";
import { deleteContactMessage } from "@/app/actions/contact";
import { AdminNav } from "@/components/admin/admin-nav"; // Import the dynamic nav

export default async function AdminInboxPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans pb-24 transition-colors duration-300">

      {/* UNIFIED ADMIN NAVIGATION */}
      <AdminNav />

      <div className="flex items-center gap-3 mb-8">
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <Inbox className="h-8 w-8 text-brand transition-colors duration-300" />
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">Customer Inbox</h1>
      </div>

      <div className="grid gap-6">
        {messages.length === 0 ? (
          // REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50
          <div className="bg-surface-card border border-zinc-800/50 rounded-3xl p-12 text-center text-zinc-500 font-bold uppercase tracking-widest transition-colors duration-300">
            No messages yet.
          </div>
        ) : (
          messages.map((msg) => (
            // REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50
            <div key={msg.id} className="bg-surface-card border border-zinc-800/50 rounded-2xl p-6 shadow-xl relative group transition-colors duration-300">
              <form action={async () => { "use server"; await deleteContactMessage(msg.id); }} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="submit" className="text-zinc-600 hover:text-red-500 transition-colors duration-300">
                  <Trash2 className="w-5 h-5" />
                </button>
              </form>

              <div className="flex flex-wrap gap-x-8 gap-y-4 mb-4 pb-4 border-b border-zinc-800/50">
                <div>
                  <h3 className="text-lg font-bold text-white">{msg.firstName} {msg.lastName}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    {/* REPLACED: hover:text-yellow-500 -> hover:text-brand */}
                    <Mail className="w-3 h-3" /> <a href={`mailto:${msg.email}`} className="hover:text-brand transition-colors duration-300">{msg.email}</a>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Service Type</p>
                  {/* REPLACED: bg-yellow-500/10 text-yellow-500 border-yellow-500/20 -> bg-brand/10 text-brand border-brand/20 */}
                  <span className="bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300">{msg.serviceType}</span>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Contact Phone</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold">
                    <Phone className="w-3 h-3 text-zinc-500" /> {msg.phone}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Received On</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Calendar className="w-3 h-3" /> {msg.createdAt.toLocaleDateString()} {msg.createdAt.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 */}
              <div className="bg-surface-bg p-4 rounded-xl border border-zinc-800/50 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed transition-colors duration-300">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}