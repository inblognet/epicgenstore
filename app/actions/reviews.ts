// app/actions/reviews.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitReview(productId: string, rating: number, comment: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to leave a review." };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5." };
    }

    // Upsert creates a new review or updates an existing one for this user/product combo
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: session.user.id,
        productId: productId,
        rating,
        comment,
      },
    });

    // Refresh the pages so the new review shows up instantly
    revalidatePath('/profile');
    revalidatePath('/products');

    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}