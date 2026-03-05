// components/admin/delete-order-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { deleteOrder } from "@/app/actions/orders";

interface DeleteOrderButtonProps {
  orderId: string;
}

export function DeleteOrderButton({ orderId }: DeleteOrderButtonProps) {
  const handleConfirm = (e: React.FormEvent) => {
    if (!confirm("Are you sure you want to delete this order? This cannot be undone.")) {
      e.preventDefault();
    }
  };

  return (
    // Wrap deleteOrder in an arrow function to return void/Promise<void>
    <form
      action={async (formData) => {
        await deleteOrder(formData);
      }}
      onSubmit={handleConfirm}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-500/20"
        title="Delete Order"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}