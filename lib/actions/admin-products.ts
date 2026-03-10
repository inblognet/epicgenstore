// lib/actions/admin-products.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export async function toggleProductPromotion(productId: string, setOnSale: boolean, customSalePrice: number | null) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        onSale: setOnSale,
        salePrice: setOnSale ? customSalePrice : null, // Set price if true, clear it if false
      },
    });

    // CLEAR THE REDIS CACHE
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

// 🚀 NEW: Delete Product Function with Cache Clearing
export async function deleteProduct(productId: string) {
  try {
    // 1. Delete the product from the PostgreSQL database
    await prisma.product.delete({
      where: { id: productId },
    });

    // 2. CLEAR THE REDIS CACHE!
    // - Clears the homepage so the deleted product disappears from New Arrivals/Promos
    await redis.del("epicgenstore:homepage:data");

    // - Clears the category sidebar so the product count numbers update accurately
    await redis.del("epicgenstore:categories:filters");

    // - (Optional) Clear the specific product page cache just in case someone has the direct link
    await redis.del(`epicgenstore:product:${productId}`);

    // 3. REFRESH NEXT.JS ROUTES
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false };
  }
}