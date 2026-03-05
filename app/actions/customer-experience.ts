// app/actions/customer-experience.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // Assuming you have auth set up
import { revalidatePath } from "next/cache";

// FETCH (Public and Admin)
export async function getExperienceImages() {
  return await prisma.customerExperienceImage.findMany({
    orderBy: { order: "asc" } // Return them sorted
  });
}

// CREATE (Admin)
export async function addExperienceImage(imageUrl: string, altText?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  // Get current highest order to append to the end
  const highestOrderImage = await prisma.customerExperienceImage.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true }
  });
  const newOrder = highestOrderImage ? highestOrderImage.order + 1 : 0;

  await prisma.customerExperienceImage.create({
    data: { url: imageUrl, altText: altText || "Customer experiencing MSK Computers products", order: newOrder }
  });

  revalidatePath("/"); // Refresh homepage carousel
  revalidatePath("/admin/customer-experiences"); // Refresh admin list
  return { success: true };
}

// DELETE (Admin)
export async function deleteExperienceImage(imageId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.customerExperienceImage.delete({
    where: { id: imageId }
  });

  revalidatePath("/");
  revalidatePath("/admin/customer-experiences");
  return { success: true };
}