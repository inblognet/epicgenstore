// app/actions/orders.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- Interfaces ---
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface OrderResponse {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Creates a new order, validates stock, and deducts inventory in one transaction.
 */
export async function placeOrder(
  cartItems: CartItem[],
  discount: number,
  voucherCode?: string
): Promise<OrderResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Please login to place an order." };

    return await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;

      for (const item of cartItems) {
        // Fetch fresh product data to verify stock and price
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { stock: true, price: true, salePrice: true, name: true }
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product?.name || 'an item in your cart'}.`);
        }

        const currentPrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
        calculatedTotal += currentPrice * item.quantity;

        // Deduct inventory stock
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      const finalGrandTotal = calculatedTotal - discount;

      // Create the Order and its nested items
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          total: finalGrandTotal,
          discount: discount,
          voucherCode: voucherCode || null,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price, // Snapshotted price at time of purchase
            })),
          },
        },
      });

      return { success: true, orderId: order.id };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to place order.";
    console.error("Order processing error:", error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an existing order with a bank slip image URL.
 */
export async function updateOrderSlip(orderId: string, slipUrl: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.order.update({
      where: {
        id: orderId,
        userId: session.user.id
      },
      data: {
        bankSlipUrl: slipUrl,
      }
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Slip update error:", error);
    return { success: false, error: "Failed to upload slip." };
  }
}

/**
 * Deletes an order and its associated items from the database.
 * Accessible only by ADMIN users.
 */
export async function deleteOrder(formData: FormData) {
  const orderId = formData.get("orderId") as string;

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required.");
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Order deletion error:", error);
    return { success: false, error: "Failed to delete order." };
  }
}