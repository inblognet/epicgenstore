// app/actions/data-import.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import * as xlsx from "xlsx";
import { revalidatePath } from "next/cache";

interface ProductRow {
  name?: string;
  slug?: string;
  price?: string | number;
  salePrice?: string | number;
  stock?: string | number;
  imageUrl?: string;
  categories?: string;
  tags?: string;
  description?: string;
}

interface CategoryRow {
  name?: string;
  slug?: string;
  imageUrl?: string;
}

type DescriptionPayload = Record<string, unknown> | string | typeof Prisma.DbNull;

// 🚀 FIXED: Replaced 'any' with 'unknown' for strict TypeScript compliance
const sanitizeText = (text: unknown) => {
  if (!text) return "";
  return String(text)
    .replace(/[\n\r\t]/g, ' ') // Replace newlines, carriage returns, and tabs with a space
    .replace(/\s+/g, ' ')      // Collapse multiple spaces into a single space
    .trim()
    .toLowerCase();
};

export async function importDataAction(formData: FormData, model: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file uploaded." };

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) return { success: false, error: "The Excel file is empty." };

    if (model === "product") {
      let successCount = 0;

      const dbCategories = await prisma.category.findMany({ select: { slug: true, name: true } });
      const dbTags = await prisma.tag.findMany({ select: { slug: true, name: true } });

      // We pass the database names/slugs through the exact same sanitizer to guarantee a perfect match
      const categoryMap = new Map<string, string>();
      dbCategories.forEach(c => {
        categoryMap.set(sanitizeText(c.slug), c.slug);
        categoryMap.set(sanitizeText(c.name), c.slug);
      });

      const tagMap = new Map<string, string>();
      dbTags.forEach(t => {
        tagMap.set(sanitizeText(t.slug), t.slug);
        tagMap.set(sanitizeText(t.name), t.slug);
      });

      for (const row of jsonData as ProductRow[]) {
        if (!row.name || !row.slug || !row.price) continue;

        const categorySlugs = row.categories
          ? String(row.categories).split(",")
              .map(s => sanitizeText(s))
              .map(val => categoryMap.get(val))
              .filter(Boolean) as string[]
          : [];

        const tagSlugs = row.tags
          ? String(row.tags).split(",")
              .map(s => sanitizeText(s))
              .map(val => tagMap.get(val))
              .filter(Boolean) as string[]
          : [];

        let parsedDescription: DescriptionPayload = Prisma.DbNull;
        if (row.description) {
          try {
            parsedDescription = JSON.parse(row.description) as Record<string, unknown>;
          } catch {
            parsedDescription = row.description;
          }
        }

        await prisma.product.upsert({
          where: { slug: row.slug },
          update: {
            name: row.name,
            price: Number(row.price),
            salePrice: row.salePrice ? Number(row.salePrice) : null,
            stock: row.stock ? Number(row.stock) : 0,
            imageUrl: row.imageUrl || null,
            description: parsedDescription as Prisma.InputJsonValue,
            categories: { set: categorySlugs.map(slug => ({ slug })) },
            tags: { set: tagSlugs.map(slug => ({ slug })) }
          },
          create: {
            name: row.name,
            slug: row.slug,
            price: Number(row.price),
            salePrice: row.salePrice ? Number(row.salePrice) : null,
            stock: row.stock ? Number(row.stock) : 0,
            imageUrl: row.imageUrl || null,
            description: parsedDescription as Prisma.InputJsonValue,
            categories: { connect: categorySlugs.map(slug => ({ slug })) },
            tags: { connect: tagSlugs.map(slug => ({ slug })) }
          }
        });
        successCount++;
      }
      revalidatePath("/products");
      revalidatePath("/admin/products");
      return { success: true, message: `Successfully imported ${successCount} products!` };
    }

    if (model === "category") {
      let successCount = 0;

      for (const row of jsonData as CategoryRow[]) {
        if (!row.name || !row.slug) continue;
        await prisma.category.upsert({
          where: { slug: row.slug },
          update: { name: row.name, imageUrl: row.imageUrl || null },
          create: { name: row.name, slug: row.slug, imageUrl: row.imageUrl || null }
        });
        successCount++;
      }
      revalidatePath("/products");
      return { success: true, message: `Successfully imported ${successCount} categories!` };
    }

    return { success: false, error: "Model import logic not implemented yet." };

  } catch (error) {
    console.error("Import Error:", error);
    return { success: false, error: "Failed to parse or save the Excel file. Check data formats." };
  }
}