// app/(admin)/admin/users/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AdminNav } from "@/components/admin/admin-nav";
import { Users, Shield, User as UserIcon } from "lucide-react";
import { UserRoleSelect } from "./user-role-select";
import { DeleteUserButton } from "./delete-user-button"; // 🚀 NEW: Imported our delete button
import { Role } from "@prisma/client";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all users, newest first
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // --- SECURE SERVER ACTION: UPDATE ROLE ---
  async function updateUserRole(userId: string, newRole: string) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    // Safety check: Admins cannot accidentally demote themselves
    if (userId === currentSession.user.id) {
      return { success: false, error: "You cannot change your own role." };
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole as Role },
      });

      revalidatePath("/admin/users");
      return { success: true };
    } catch (error) {
      console.error("Failed to update user role:", error);
      return { success: false, error: "Failed to update user role in database." };
    }
  }

  // --- 🚀 NEW SECURE SERVER ACTION: DELETE USER ---
  async function deleteUser(userId: string) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    // Safety check: Admins cannot accidentally delete themselves
    if (userId === currentSession.user.id) {
      return { success: false, error: "You cannot delete your own account." };
    }

    try {
      await prisma.user.delete({
        where: { id: userId },
      });

      revalidatePath("/admin/users");
      return { success: true };
    } catch (error) {
      console.error("Failed to delete user:", error);
      // NOTE: If this fails, it's usually because the user has Orders tied to them and you have strict relational constraints in Prisma.
      return { success: false, error: "Failed to delete user. They may have associated orders in the database." };
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans transition-colors duration-300 w-full overflow-hidden">
      <AdminNav />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Users className="h-6 w-6 md:h-8 md:w-8 text-brand transition-colors duration-300" />
          User Management
        </h1>
        <div className="bg-surface-card border border-zinc-800/50 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Users:</span>
          <span className="text-brand font-black">{users.length}</span>
        </div>
      </div>

      <div className="bg-surface-card border border-zinc-800/50 rounded-xl shadow-lg transition-colors duration-300 w-full overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[650px] text-sm text-left text-zinc-300">
            <thead className="bg-surface-bg/50 border-b border-zinc-800/50 text-zinc-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 md:px-6 py-4 whitespace-nowrap">User</th>
                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Email</th>
                <th className="px-4 md:px-6 py-4 whitespace-nowrap text-center">Joined Date</th>
                <th className="px-4 md:px-6 py-4 text-right whitespace-nowrap">Role & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors duration-200">

                  {/* Avatar & Name */}
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-bg border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                        {user.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                          {user.name || "Unknown User"}
                          {user.role === "ADMIN" && <Shield className="w-3 h-3 text-brand" />}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 md:px-6 py-4 text-zinc-400">
                    {user.email}
                  </td>

                  {/* Joined Date */}
                  <td className="px-4 md:px-6 py-4 text-center text-zinc-500 text-xs font-medium">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>

                  {/* Role Selection & Delete Action */}
                  <td className="px-4 md:px-6 py-4 flex items-center justify-end gap-3">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role}
                      isCurrentUser={user.id === session.user.id}
                      updateRoleAction={updateUserRole}
                    />

                    {/* 🚀 NEW: Delete user button */}
                    <DeleteUserButton
                      userId={user.id}
                      isCurrentUser={user.id === session.user.id}
                      deleteAction={deleteUser}
                    />
                  </td>

                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No users found in the database.
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