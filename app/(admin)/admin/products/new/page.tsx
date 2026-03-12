// app/(admin)/admin/products/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewProductForm } from "./new-product-form";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export default async function NewProductPage() {
  // 1. SECURE THE ROUTE
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // 2. Fetch categories and tags to pass to the client form
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);

  // 3. The secure Server Action
  async function createProductAction(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    try {
      const name = formData.get("name") as string;
      let slug = formData.get("slug") as string;
      const price = parseFloat(formData.get("price") as string);
      const imageUrl = formData.get("imageUrl") as string;
      const stock = parseInt(formData.get("stock") as string, 10);

      // 🚀 FIXED: Grab the description string from the form
      const descriptionString = formData.get("description") as string;

      const tagIds = formData.getAll("tagIds") as string[];
      const categoryIds = formData.getAll("categoryIds") as string[];

      const subImagesJson = formData.get("subImages") as string;
      const imagesArray: string[] = subImagesJson ? JSON.parse(subImagesJson) : [];
      const validImages = imagesArray.filter(url => url.trim() !== "");

      if (!name || !slug || isNaN(price) || isNaN(stock)) {
        return { success: false, error: "Please fill out all required fields correctly." };
      }

      slug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

      // 🚀 FIXED: Parse the JSON string back into a real object before saving
      const parsedDescription = descriptionString ? JSON.parse(descriptionString) : null;

      // Save to database
      await prisma.product.create({
        data: {
          name,
          slug,
          price,
          imageUrl: imageUrl || null,
          images: validImages,
          stock,
          // 🚀 FIXED: Pass the parsed JSON object to Prisma
          description: parsedDescription,
          categories: {
            connect: categoryIds.map(id => ({ id }))
          },
          tags: {
            connect: tagIds.map(id => ({ id }))
          }
        },
      });

      // --- CLEAR REDIS CACHE SO THE STOREFRONT UPDATES INSTANTLY ---
      await redis.del("epicgenstore:homepage:data");
      await redis.del("epicgenstore:categories:filters");

      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/products");

      return { success: true };
    } catch (error) {
      console.error("Database error:", error);
      return { success: false, error: "A database error occurred while saving." };
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl text-zinc-50 font-sans">
      <Link href="/admin/products" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-yellow-500 mb-8 transition-colors tracking-wide">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="border-b border-zinc-800 pb-6 mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="w-2 h-6 bg-yellow-500 rounded-full inline-block"></span>
            Add New Product
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">Create a new item in your store inventory.</p>
        </div>

        {/* Inject our shiny new Client Component and pass the Server Action to it! */}
        <NewProductForm
          categories={categories}
          tags={tags}
          createProductAction={createProductAction}
        />

      </div>
    </div>
  );
}