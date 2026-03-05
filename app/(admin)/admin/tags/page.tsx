// app/(admin)/admin/tags/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Tags, Plus, Trash2 } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminTagsPage() {
  // 1. Secure the page for ADMINs only
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  // 2. Fetch existing tags and count how many products use them
  const tags = await prisma.tag.findMany({
    orderBy: [
      { title: 'asc' }, // Group by title first
      { name: 'asc' }   // Then sort alphabetically
    ],
    include: {
      _count: { select: { products: true } }
    }
  });

  // --- SERVER ACTIONS ---
  async function createTag(formData: FormData) {
    "use server";
    const title = formData.get("title") as string; // NEW: Capture the Group Title
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    if (!title || !name || !slug) return;

    try {
      // NEW: Save the title to the database
      await prisma.tag.create({ data: { title, name, slug } });
      revalidatePath("/admin/tags");
    } catch (error) {
      console.error("Failed to create tag. Slug might already exist.");
    }
  }

  async function deleteTag(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.tag.delete({ where: { id } });
    revalidatePath("/admin/tags");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-theme-main font-sans transition-colors duration-300">
      <AdminNav />

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <Tags className="h-8 w-8 text-brand transition-colors duration-300" />
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-main">Tag Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: CREATE TAG FORM */}
        <div className="lg:col-span-1">
          <form action={createTag} className="bg-surface-card border border-theme-border rounded-3xl p-6 shadow-xl flex flex-col gap-5 transition-colors duration-300 sticky top-8">
            <h2 className="text-xl font-bold text-theme-main">Create New Tag</h2>

            {/* --- NEW TITLE INPUT --- */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Group Title (e.g. Brand, Chipset)</label>
              <input
                name="title"
                required
                placeholder="e.g. Screen Size"
                className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Tag Name (e.g. Intel, Asus)</label>
              <input
                name="name"
                required
                placeholder="e.g. 24 Inch"
                className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">URL Slug (No spaces)</label>
              <input
                name="slug"
                required
                placeholder="e.g. 24-inch"
                className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 text-theme-main focus:border-brand outline-none transition-colors"
              />
            </div>

            <button type="submit" className="h-12 mt-2 bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all">
              <Plus className="w-5 h-5" /> Add Tag
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: EXISTING TAGS LIST */}
        <div className="lg:col-span-2">
          <div className="bg-surface-card border border-theme-border rounded-3xl p-6 md:p-8 shadow-xl transition-colors duration-300">
            <h2 className="text-xl font-bold text-theme-main mb-6">Active Tags</h2>

            {tags.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-theme-border rounded-xl text-theme-muted">
                No tags created yet. Create your first tag on the left!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-4 bg-surface-bg border border-theme-border rounded-xl hover:border-brand transition-colors group">
                    <div className="flex flex-col">
                      {/* --- NEW: Display the Title above the Name --- */}
                      <span className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">{tag.title}</span>
                      <span className="font-bold text-theme-main">{tag.name}</span>
                      <span className="text-xs text-theme-muted mt-1">
                        /{tag.slug} • <span className="text-brand font-medium">{tag._count.products} Products</span>
                      </span>
                    </div>

                    <form action={deleteTag}>
                      <input type="hidden" name="id" value={tag.id} />
                      <button
                        type="submit"
                        title="Delete Tag"
                        className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}