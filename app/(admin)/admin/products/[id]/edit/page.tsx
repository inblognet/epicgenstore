// app/(admin)/admin/products/[id]/edit/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditProductForm } from "./edit-product-form";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // Fetch the product with its categories and tags
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { tags: true, categories: true }
  });

  if (!product) {
    return notFound();
  }

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } })
  ]);

  // Secure Server Action
  async function updateProductAction(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    try {
      const name = formData.get("name") as string;
      let slug = formData.get("slug") as string;
      const price = parseFloat(formData.get("price") as string);
      const imageUrl = formData.get("imageUrl") as string;
      const stock = parseInt(formData.get("stock") as string, 10);
      const description = formData.get("description") as string;

      const tagIds = formData.getAll("tagIds") as string[];
      const categoryIds = formData.getAll("categoryIds") as string[];

      const subImagesJson = formData.get("subImages") as string;
      const imagesArray: string[] = subImagesJson ? JSON.parse(subImagesJson) : [];
      const validImages = imagesArray.filter(url => url.trim() !== "");

      if (!name || !slug || isNaN(price) || isNaN(stock)) {
        return { success: false, error: "Please fill out all required fields correctly." };
      }

      slug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

      await prisma.product.update({
        where: { id: productId },
        data: {
          name,
          slug,
          price,
          imageUrl: imageUrl || null,
          images: validImages,
          stock,
          description: description || null,
          tags: {
            set: tagIds.map(id => ({ id }))
          },
          categories: {
            set: categoryIds.map(id => ({ id }))
          }
        },
      });

      // --- CLEAR REDIS CACHES ---
      // Clear homepage and sidebar filters
      await redis.del("epicgenstore:homepage:data");
      await redis.del("epicgenstore:categories:filters");

      // Clear the specific product page caches (we delete both old and new slug just in case they changed it)
      await redis.del(`epicgenstore:product:${product!.slug}`);
      await redis.del(`epicgenstore:product:${slug}`);

      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/products");
      revalidatePath(`/product/${slug}`);

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Database error occurred while updating." };
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl text-zinc-50 font-sans">
      <Link href="/admin/products" className="inline-flex items-center text-sm font-bold text-zinc-400 hover:text-yellow-500 mb-8 transition-colors uppercase tracking-wider">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-yellow-500 mb-8 tracking-tight flex items-center gap-3">
          <span className="w-2 h-6 bg-yellow-500 rounded-full inline-block"></span>
          Edit Product
        </h1>

        {/* Inject our Client Form here */}
        <EditProductForm
          product={product}
          categories={categories}
          tags={tags}
          updateProductAction={updateProductAction}
        />

      </div>
    </div>
  );
}