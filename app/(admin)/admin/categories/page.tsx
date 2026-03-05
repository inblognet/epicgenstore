// app/(admin)/admin/categories/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, FolderTree, Edit, Save, X, CornerDownRight, Image as ImageIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AdminNav } from "@/components/admin/admin-nav";

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

  // --- SERVER ACTIONS ---
  async function createCategory(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;
    const imageUrl = formData.get("imageUrl") as string; // NEW: Get imageUrl

    if (!name || !slug) throw new Error("Name and slug are required.");
    slug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

    await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
        imageUrl: imageUrl || null // NEW: Save imageUrl
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/"); // Revalidate home page for the new carousel
  }

  async function updateCategory(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;
    const imageUrl = formData.get("imageUrl") as string; // NEW: Get imageUrl

    if (!id || !name || !slug) throw new Error("Missing required fields.");
    if (id === parentId) throw new Error("A category cannot be its own parent.");

    slug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
        imageUrl: imageUrl || null // NEW: Save imageUrl
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/"); // Revalidate home page for the new carousel
    redirect("/admin/categories");
  }

  async function deleteCategory(id: string) {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");
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
        {/* LEFT COLUMN: Create / Edit Form */}
        <div className="md:col-span-1">
          <div className={`bg-surface-card border transition-all duration-300 ${editingCategory ? 'border-brand shadow-lg shadow-brand/10' : 'border-zinc-800/50'} rounded-xl p-6 sticky top-24`}>

            <h2 className="text-xl font-bold mb-6 text-brand flex items-center gap-2 transition-colors duration-300">
              {editingCategory ? <Edit className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>

            <form action={editingCategory ? updateCategory : createCategory} className="space-y-4">
              {editingCategory && <input type="hidden" name="id" value={editingCategory.id} />}

              <div className="space-y-2">
                <label htmlFor="parentId" className="text-sm font-medium text-zinc-300">Parent Category</label>
                <select
                  id="parentId"
                  name="parentId"
                  defaultValue={editingCategory?.parentId || ""}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300"
                >
                  <option value="" className="text-zinc-500">None (Make Top-Level)</option>
                  {topLevelCategories
                    .filter(c => c.id !== editingCategory?.id)
                    .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-zinc-300">Name *</label>
                <input type="text" id="name" name="name" required defaultValue={editingCategory?.name || ""} placeholder="e.g. Gaming Laptops" className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300" />
              </div>

              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium text-zinc-300">URL Slug *</label>
                <input type="text" id="slug" name="slug" required defaultValue={editingCategory?.slug || ""} placeholder="e.g. gaming-laptops" className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300" />
              </div>

              {/* --- NEW: Image URL Input --- */}
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="text-sm font-medium text-zinc-300">Image URL (Optional)</label>
                <input type="text" id="imageUrl" name="imageUrl" defaultValue={editingCategory?.imageUrl || ""} placeholder="https://example.com/image.jpg" className="flex h-10 w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300" />
                <p className="text-[10px] text-zinc-500">Required if you want this category to show on the Home Page carousel.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-zinc-300">Description</label>
                <textarea id="description" name="description" rows={3} defaultValue={editingCategory?.description || ""} placeholder="Optional brief description..." className="flex w-full rounded-md border border-zinc-800 bg-surface-bg px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300"></textarea>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-black font-bold transition-all duration-300 active:scale-95 shadow-md shadow-brand/10">
                  {editingCategory ? <><Save className="mr-2 h-4 w-4" /> Save Changes</> : <><Plus className="mr-2 h-4 w-4" /> Add Category</>}
                </Button>

                {editingCategory && (
                  <Button asChild variant="outline" className="w-full border-zinc-700 bg-transparent text-zinc-300 hover:text-white hover:bg-surface-bg transition-colors">
                    <Link href="/admin/categories"><X className="mr-2 h-4 w-4" /> Cancel Edit</Link>
                  </Button>
                )}
              </div>
            </form>
          </div>
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