"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(formData: FormData) {
  try {
    await prisma.contactMessage.create({
      data: {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        serviceType: formData.get("serviceType") as string,
        message: formData.get("message") as string,
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to submit message", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function deleteContactMessage(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/inbox");
  return { success: true };
}