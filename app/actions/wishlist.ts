// app/actions/wishlist.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  const session = await auth();

  // Enterprise rule: Users must be logged in to save items across devices
  if (!session?.user?.id) {
    return { success: false, message: "Please log in to save items." };
  }

  const userId = session.user.id;

  try {
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingItem) {
      // If it exists, remove it (Toggle OFF)
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      revalidatePath("/"); // Update UI everywhere
      return { success: true, isWishlisted: false };
    } else {
      // If it doesn't exist, add it (Toggle ON)
      await prisma.wishlistItem.create({
        data: { userId, productId },
      });
      revalidatePath("/"); // Update UI everywhere
      return { success: true, isWishlisted: true };
    }
  } catch (error) {
    return { success: false, message: "Something went wrong." };
  }
}