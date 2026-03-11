// app/(admin)/admin/categories/page.tsx
// cspell:ignore epicgenstore
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, FolderTree, Edit, CornerDownRight, Image as ImageIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AdminNav } from "@/components/admin/admin-nav";
import { redis } from "@/lib/redis"; // 🚀 Import Redis!
import { CategoryForm } from "./CategoryForm"; // 🚀 Import our new form

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedParams = await searchParams;
  const editId = resolvedParams.edit;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: true,
      _count: { select: { products: true } }
    }
  });

  type CategoryWithDetails = typeof categories[0];
  const hierarchicalCategories: (CategoryWithDetails & { isChild: boolean })[] = [];

  const topLevelCategories = categories.filter(c => c.parentId === null);

  topLevelCategories.forEach(parent => {
    hierarchicalCategories.push({ ...parent, isChild: false });
    const children = categories.filter(c => c.parentId === parent.id);
    children.forEach(child => {
      hierarchicalCategories.push({ ...child, isChild: true });
    });
  });

  const editingCategory = editId
    ? await prisma.category.findUnique({ where: { id: editId } })
    : null;

  // --- SECURE SERVER ACTIONS ---
  async function createCategoryAction(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!name || !slug) return { success: false, error: "Name and slug are required." };
    slug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

    try {
      await prisma.category.create({
        data: {
          name,
          slug,
          description: description || null,
          parentId: parentId || null,
          imageUrl: imageUrl || null
        },
      });

      // 🚀 CLEAR REDIS CACHE
      await redis.del("epicgenstore:categories:filters");
      await redis.del("epicgenstore:homepage:data");

      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/categories");

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to save category." };
    }
  }

  async function updateCategoryAction(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!id || !name || !slug) return { success: false, error: "Missing required fields." };
    if (id === parentId) return { success: false, error: "A category cannot be its own parent." };

    slug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

    try {
      await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || null,
          parentId: parentId || null,
          imageUrl: imageUrl || null
        },
      });

      // 🚀 CLEAR REDIS CACHE
      await redis.del("epicgenstore:categories:filters");
      await redis.del("epicgenstore:homepage:data");

      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/categories");

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to update category." };
    }
  }

  async function deleteCategory(id: string) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.category.delete({ where: { id } });

    // 🚀 CLEAR REDIS CACHE
    await redis.del("epicgenstore:categories:filters");
    await redis.del("epicgenstore:homepage:data");

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");
    if (id === editId) redirect("/admin/categories");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans transition-colors duration-300">
      <AdminNav />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-brand transition-colors duration-300" />
          Category Manager
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Create / Edit Form Component */}
        <div className="md:col-span-1">
          <CategoryForm
            editingCategory={editingCategory}
            topLevelCategories={topLevelCategories}
            createCategoryAction={createCategoryAction}
            updateCategoryAction={updateCategoryAction}
          />
        </div>

        {/* RIGHT COLUMN: Nested Tree Table */}
        <div className="md:col-span-2">
          <div className="bg-surface-card border border-zinc-800/50 rounded-xl overflow-hidden shadow-lg transition-colors duration-300">
            <table className="w-full text-sm text-left text-zinc-300">
              <thead className="bg-surface-bg/50 border-b border-zinc-800/50 text-zinc-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Hierarchy</th>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-center">Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">

                {hierarchicalCategories.map((category) => (
                  <tr key={category.id} className={`hover:bg-zinc-800/30 transition-colors duration-200 ${category.isChild ? 'bg-surface-bg/30' : ''}`}>

                    <td className="px-6 py-4">
                      {category.isChild ? (
                        <div className="flex items-center gap-3 pl-6">
                          <CornerDownRight className="w-4 h-4 text-zinc-600" />
                          <span className="font-bold text-zinc-300">{category.name}</span>
                        </div>
                      ) : (
                        <span className="font-black text-white text-base">{category.name}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {category.imageUrl ? (
                        <div className="w-10 h-10 rounded bg-surface-bg border border-zinc-800 flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain p-1" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-surface-bg border border-zinc-800 flex items-center justify-center text-zinc-700">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-zinc-500 font-mono text-[10px]">{category.slug}</td>

                    <td className="px-6 py-4 text-center">
                      <span className="bg-surface-bg text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-zinc-800/50 transition-colors duration-300">
                        {category._count.products}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild className="border-zinc-700 bg-surface-bg text-zinc-300 hover:bg-brand hover:text-black hover:border-brand transition-colors duration-300">
                          <Link href={`/admin/categories?edit=${category.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <form action={deleteCategory.bind(null, category.id)}>
                          <Button type="submit" variant="outline" size="icon" className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}

                {hierarchicalCategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-medium">
                      No categories found. Create your first one on the left!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}