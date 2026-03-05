// app/(admin)/admin/carousels/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LayoutTemplate, Plus, Trash2, Eye, EyeOff, Image as ImageIcon, Pencil, X } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { MainImageUploader } from "@/components/admin/main-image-uploader";
import Link from "next/link";

export default async function AdminCarouselsPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const editId = searchParams.edit;

  // Fetch all categories, existing carousels, and potentially the carousel being edited
  const [categories, carousels, editCarousel] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.carousel.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    editId
      ? prisma.carousel.findUnique({ where: { id: parseInt(editId, 10) } })
      : Promise.resolve(null),
  ]);

  // --- SERVER ACTIONS ---
  async function createCarousel(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;

    const imageUrl = formData.get("imageUrl") as string;
    const imageTitle = formData.get("imageTitle") as string;
    const imageSubtitle = formData.get("imageSubtitle") as string;
    const imageButtonText = formData.get("imageButtonText") as string;

    if (!title) return;

    await prisma.carousel.create({
      data: {
        title,
        categoryId: categoryId || null,
        imageUrl: imageUrl || null,
        imageTitle: imageTitle || null,
        imageSubtitle: imageSubtitle || null,
        imageButtonText: imageButtonText || null,
      },
    });

    revalidatePath("/admin/carousels");
    revalidatePath("/");
  }

  // --- NEW: Update Action for Editing ---
  async function updateCarousel(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;

    const newImageUrl = formData.get("imageUrl") as string;
    const existingImageUrl = formData.get("existingImageUrl") as string;
    const imageTitle = formData.get("imageTitle") as string;
    const imageSubtitle = formData.get("imageSubtitle") as string;
    const imageButtonText = formData.get("imageButtonText") as string;

    if (!title || !id) return;

    await prisma.carousel.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        categoryId: categoryId || null,
        // If a new image was uploaded, use it. Otherwise, keep the existing one.
        imageUrl: newImageUrl || existingImageUrl || null,
        imageTitle: imageTitle || null,
        imageSubtitle: imageSubtitle || null,
        imageButtonText: imageButtonText || null,
      },
    });

    revalidatePath("/admin/carousels");
    revalidatePath("/");
    redirect("/admin/carousels"); // Clear the ?edit param from URL
  }

  // --- FIXED: Use `.bind` arguments instead of FormData to prevent boolean parsing bugs ---
  async function deleteCarousel(id: number) {
    "use server";
    await prisma.carousel.delete({ where: { id } });
    revalidatePath("/admin/carousels");
    revalidatePath("/");
  }

  async function toggleVisibility(id: number, currentStatus: boolean) {
    "use server";
    await prisma.carousel.update({
      where: { id },
      data: { isVisible: !currentStatus },
    });
    revalidatePath("/admin/carousels");
    revalidatePath("/");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-theme-main font-sans transition-colors duration-300">
      <AdminNav />

      <div className="flex items-center gap-3 mb-8">
        <LayoutTemplate className="h-8 w-8 text-brand" />
        <h1 className="text-3xl font-extrabold tracking-tight">Page Carousel Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* CREATE / EDIT FORM */}
        <div className="lg:col-span-1 sticky top-8 space-y-6">
          <form
            action={editCarousel ? updateCarousel : createCarousel}
            className={`border rounded-3xl p-6 shadow-xl flex flex-col gap-6 transition-all duration-300 ${
              editCarousel ? "bg-brand/5 border-brand/50" : "bg-surface-card border-theme-border"
            }`}
          >
            <div className="flex items-center justify-between border-b border-theme-border pb-4">
              <h2 className="text-xl font-bold text-theme-main">
                {editCarousel ? "Edit Section" : "Create New Section"}
              </h2>
              {editCarousel && (
                <Link href="/admin/carousels" className="p-1 hover:bg-surface-bg rounded-full text-theme-muted hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Hidden fields for editing state */}
            {editCarousel && <input type="hidden" name="id" value={editCarousel.id} />}
            {editCarousel && <input type="hidden" name="existingImageUrl" value={editCarousel.imageUrl || ""} />}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Display Title *</label>
              <input
                name="title"
                required
                defaultValue={editCarousel?.title || ""}
                placeholder="e.g. GAMING MOTHERBOARDS"
                className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 focus:border-brand outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Target Category</label>
              <select
                name="categoryId"
                defaultValue={editCarousel?.categoryId || ""}
                className="w-full h-12 bg-surface-bg border border-theme-border rounded-xl px-4 focus:border-brand outline-none cursor-pointer transition-colors text-sm"
              >
                <option value="">None (Banner Only)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-theme-muted leading-tight">
                Selecting a category will automatically pull its products into a carousel layout.
              </p>
            </div>

            {/* Banner Settings Section */}
            <div className="pt-4 border-t border-theme-border space-y-5">
              <h3 className="text-sm font-bold flex items-center gap-2 text-brand">
                <ImageIcon className="w-4 h-4" /> Optional Side Banner
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">
                  Upload Banner Image
                </label>
                <MainImageUploader />
                {editCarousel?.imageUrl && (
                  <p className="text-[10px] text-brand italic">
                    An image is currently uploaded. Uploading a new one will replace it.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Banner Title</label>
                <input
                  name="imageTitle"
                  defaultValue={editCarousel?.imageTitle || ""}
                  placeholder="e.g. OPTIMIZED FOR YOUR BUDGET"
                  className="w-full h-10 bg-surface-bg border border-theme-border rounded-lg px-3 text-sm focus:border-brand outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Banner Subtitle</label>
                <input
                  name="imageSubtitle"
                  defaultValue={editCarousel?.imageSubtitle || ""}
                  placeholder="e.g. BEST GAMING PCS"
                  className="w-full h-10 bg-surface-bg border border-theme-border rounded-lg px-3 text-sm focus:border-brand outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Button Text</label>
                <input
                  name="imageButtonText"
                  defaultValue={editCarousel?.imageButtonText || ""}
                  placeholder="e.g. Shop Now"
                  className="w-full h-10 bg-surface-bg border border-theme-border rounded-lg px-3 text-sm focus:border-brand outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-12 mt-4 w-full bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-brand/20"
            >
              {editCarousel ? (
                <>
                  <Pencil className="w-5 h-5" /> Update Section
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Create Section
                </>
              )}
            </button>
          </form>
        </div>

        {/* EXISTING CAROUSELS LIST */}
        <div className="lg:col-span-2">
          <div className="bg-surface-card border border-theme-border rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6">Manage Sections</h2>

            {carousels.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-theme-border rounded-xl text-theme-muted">
                No sections created yet. Create one on the left!
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {carousels.map((carousel) => (
                  <div
                    key={carousel.id}
                    className={`flex items-center justify-between p-5 bg-surface-bg border border-theme-border rounded-xl transition-all ${
                      !carousel.isVisible ? "opacity-60 grayscale" : ""
                    } ${editCarousel?.id === carousel.id ? "ring-2 ring-brand" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      {carousel.imageUrl ? (
                        <div className="w-12 h-16 bg-surface-card rounded border border-theme-border overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={carousel.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                        </div>
                      ) : (
                        <div className="w-12 h-16 bg-surface-card rounded border border-theme-border border-dashed flex items-center justify-center shrink-0">
                          <LayoutTemplate className="w-4 h-4 text-theme-muted" />
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="font-bold text-lg leading-none mb-1.5">{carousel.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] bg-surface-card border border-theme-border px-2 py-0.5 rounded text-theme-muted uppercase tracking-widest">
                            {carousel.category ? `Category: ${carousel.category.name}` : "NO CATEGORY"}
                          </span>
                          {carousel.imageUrl && (
                            <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded uppercase tracking-widest">
                              Mixed Layout
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* EDIT */}
                      <Link
                        href={`/admin/carousels?edit=${carousel.id}`}
                        title="Edit Section"
                        className="p-2 text-theme-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>

                      {/* TOGGLE VISIBILITY */}
                      <form action={toggleVisibility.bind(null, carousel.id, carousel.isVisible)}>
                        <button
                          type="submit"
                          title={carousel.isVisible ? "Hide Section" : "Display Section"}
                          className={`p-2 rounded-lg transition-colors ${
                            carousel.isVisible
                              ? "text-green-500 hover:bg-green-500/10"
                              : "text-theme-muted hover:bg-theme-muted/10"
                          }`}
                        >
                          {carousel.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </form>

                      {/* DELETE */}
                      <form action={deleteCarousel.bind(null, carousel.id)}>
                        <button
                          type="submit"
                          title="Delete Section"
                          className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
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