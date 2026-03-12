// app/(admin)/admin/users/delete-user-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteUserButtonProps {
  userId: string;
  isCurrentUser: boolean;
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function DeleteUserButton({ userId, isCurrentUser, deleteAction }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Don't render the delete button for the currently logged-in admin
  if (isCurrentUser) return null;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone and will remove all their data."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteAction(userId);

    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete User"
      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}