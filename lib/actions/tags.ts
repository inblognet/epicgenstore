// lib/actions/tags.ts
'use server';

import { prisma } from '@/lib/prisma';

/**
 * Fetches tags associated with products in a specific category.
 * Also returns product count for each tag for better UI.
 */
export async function getDynamicTags(categorySlugs: string[]) {
  if (categorySlugs.length === 0) {
    return [];
  }

  // 1. Get products in the target categories
  const products = await prisma.product.findMany({
      where: {
        categories: {      // FIXED: Changed to plural
          some: {          // FIXED: Added 'some' because it is an array now
            slug: { in: categorySlugs },
          }
        }
      },
      include: {
        tags: true
      }
    });

  // 2. Extract all unique tags and their IDs from those products
  const tagIds = products
    .flatMap((product) => product.tags.map((tag) => tag.id))
    .filter((id, index, self) => self.indexOf(id) === index);

  if (tagIds.length === 0) {
    return [];
  }

  // 3. Get the full tag objects and their product counts
  const tags = await prisma.tag.findMany({
    where: {
      id: { in: tagIds },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: 'asc', // FIXED: Sorted by 'name' to match your Prisma schema!
    },
  });

  return tags;
}