// lib/actions/search.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function searchProducts(query: string) {
  // If the query is empty, return nothing
  if (!query || query.trim() === "") return [];

  // 🚀 FIXED: Removed the JSON description search to prevent Prisma crashes.
  // Added Category and Tag searching to make the quick-search smarter!
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { categories: { some: { name: { contains: query, mode: "insensitive" } } } },
        { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
      ],
    },
    take: 5, // Limit to 5 results for the quick dropdown
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      imageUrl: true,
    },
  });

  // Convert Prisma's Decimal object to a plain JavaScript number to satisfy Next.js
  return products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));
}