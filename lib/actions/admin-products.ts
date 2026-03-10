// lib/actions/admin-products.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis"; // <-- 1. Import Redis

export async function toggleProductPromotion(productId: string, setOnSale: boolean, customSalePrice: number | null) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        onSale: setOnSale,
        salePrice: setOnSale ? customSalePrice : null, // Set price if true, clear it if false
      },
    });

    // 2. CLEAR THE REDIS CACHE
    // This forces the homepage to fetch the updated "Latest Promotions" list instantly
    await redis.del("epicgenstore:homepage:data");

    // Refresh the Next.js routes so the new data shows up instantly
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/"); // <-- Added this so the homepage route refreshes too

    return { success: true };
  } catch (error) {
    console.error("Error toggling promotion:", error);
    return { success: false };
  }
}