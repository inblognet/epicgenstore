// app/api/admin/categories/route.ts
// cspell:ignore epicgenstore
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client"; // 🚀 Imported strict Prisma types

export async function POST(request: Request) {
  try {
    // 1. Security: Make sure only ADMINs can hit this API
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the data sent from your CategoryForm.tsx
    const body = await request.json();
    const { name, slug, imageUrl, parentId } = body;

    // Basic validation
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
    }

    // Ensure slug is clean and lowercase
    const cleanSlug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

    // 3. Save the new category to PostgreSQL
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: cleanSlug,
        imageUrl: imageUrl || null,
        // If parentId is an empty string, set it to null in the database
        parentId: parentId ? parentId : null,
      },
    });

    // ==========================================
    // 🚀 4. CLEAR THE REDIS CACHES!
    // ==========================================
    await redis.del("epicgenstore:categories:filters"); // Updates the Products Sidebar
    await redis.del("epicgenstore:homepage:data");      // Updates the Homepage Carousel

    // 5. Tell Next.js to refresh these specific pages in the background
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    // Return success to the form!
    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    console.error("Error creating category:", error);

    // 🚀 Check if it's a unique constraint error the strict TypeScript way
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: "A category with this URL Slug already exists." }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}