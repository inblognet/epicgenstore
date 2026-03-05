// lib/actions/admin-products.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleProductPromotion(productId: string, setOnSale: boolean, customSalePrice: number | null) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        onSale: setOnSale,
        salePrice: setOnSale ? customSalePrice : null, // Set price if true, clear it if false
      },
    });

    // Refresh the pages so the new data shows up instantly
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error toggling promotion:", error);
    return { success: false };
  }
}