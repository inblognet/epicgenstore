"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCarouselSettings(items: { url: string; link: string }[]) {
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { carouselItems: items },
    create: {
      id: 1,
      carouselItems: items
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}