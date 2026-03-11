// components/admin/delete-button.tsx
"use client";

import { useAdminLoader } from "@/components/admin/admin-loading-provider";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  itemName?: string; // e.g., "Category", "Product"
  // The server action to call
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function DeleteButton({ id, itemName = "Item", deleteAction }: DeleteButtonProps) {
  const { startLoading, stopLoading } = useAdminLoader();

  const handleDelete = async () => {
    // 1. Add a safety confirmation dialog!
    if (!window.confirm(`Are you sure you want to delete this ${itemName}? This cannot be undone.`)) {
      return;
    }

    // 2. Turn on the loading screen
    startLoading(`Deleting ${itemName}...`);

    try {
      // 3. Execute the server action
      const result = await deleteAction(id);

      if (!result.success) {
        alert(result.error || `Failed to delete ${itemName}.`);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      // 4. Turn off the loading screen
      stopLoading();
    }
  };

  return (
    <Button
      onClick={handleDelete}
      type="button"
      variant="outline"
      size="icon"
      className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}