// app/(admin)/admin/users/user-role-select.tsx
"use client";

import { useAdminLoader } from "@/components/admin/admin-loading-provider";

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
  isCurrentUser: boolean;
  updateRoleAction: (userId: string, newRole: string) => Promise<{ success: boolean; error?: string }>;
}

export function UserRoleSelect({ userId, currentRole, isCurrentUser, updateRoleAction }: UserRoleSelectProps) {
  const { startLoading, stopLoading } = useAdminLoader();

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;

    // Extra safety confirmation before making someone an Admin
    if (newRole === "ADMIN") {
      if (!window.confirm("Are you sure you want to give this user full Administrator access?")) {
        e.target.value = currentRole; // Revert visually if they cancel
        return;
      }
    }

    startLoading(`Updating role to ${newRole}...`);

    try {
      const result = await updateRoleAction(userId, newRole);

      if (!result.success) {
        alert(result.error || "Failed to update role.");
        e.target.value = currentRole; // Revert visually on failure
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
      e.target.value = currentRole;
    } finally {
      stopLoading();
    }
  };

  if (isCurrentUser) {
    return (
      <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-black tracking-widest border border-brand/20 cursor-not-allowed opacity-80" title="You cannot change your own role">
        {currentRole} (YOU)
      </span>
    );
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleRoleChange}
      className={`h-8 rounded-lg px-2 text-xs font-bold tracking-widest uppercase cursor-pointer outline-none transition-colors border ${
        currentRole === "ADMIN"
          ? "bg-brand/10 text-brand border-brand/50 hover:bg-brand/20"
          : "bg-surface-bg text-zinc-300 border-zinc-700 hover:border-zinc-500"
      }`}
    >
      <option value="USER" className="bg-surface-card text-zinc-300">USER</option>
      <option value="ADMIN" className="bg-surface-card text-brand">ADMIN</option>
    </select>
  );
}