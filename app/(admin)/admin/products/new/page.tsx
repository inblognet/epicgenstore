// app/(admin)/admin/products/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FolderTree } from "lucide-react"; // --- NEW: Added FolderTree icon ---
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { MainImageUploader } from "@/components/admin/main-image-uploader";

export default async function NewProductPage() {
  // 1. SECURE THE ROUTE: Verify the user is an ADMIN
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // 2. Fetch all categories AND tags to populate the form options
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } })
  ]);

  // 3. The Server Action
  async function createProduct(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const price = parseFloat(formData.get("price") as string);
    const imageUrl = formData.get("imageUrl") as string;
    const stock = parseInt(formData.get("stock") as string, 10);
    const description = formData.get("description") as string;

    // --- NEW: Get all checked tag AND category IDs ---
    const tagIds = formData.getAll("tagIds") as string[];
    const categoryIds = formData.getAll("categoryIds") as string[];

    // --- Parse the sub-images array from the hidden input ---
    const subImagesJson = formData.get("subImages") as string;
    const imagesArray: string[] = subImagesJson ? JSON.parse(subImagesJson) : [];
    // Filter out any blank inputs before saving
    const validImages = imagesArray.filter(url => url.trim() !== "");

    if (!name || !slug || isNaN(price) || isNaN(stock)) {
      throw new Error("Please fill out all required fields correctly.");
    }

    slug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

    // Save directly to the database with the categories link, tags, and new images array
    await prisma.product.create({
      data: {
        name,
        slug,
        price,
        imageUrl: imageUrl || null,
        images: validImages,
        stock,
        description: description || null,
        // --- NEW: Link the selected categories and tags to this new product ---
        categories: {
          connect: categoryIds.map(id => ({ id }))
        },
        tags: {
          connect: tagIds.map(id => ({ id }))
        }
      },
    });

    redirect("/admin/products");
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

        <form action={createProduct} className="space-y-8">

          {/* Core Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
                placeholder="e.g. Mechanical Gaming Keyboard"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-xs font-black text-zinc-400 uppercase tracking-widest">URL Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
                placeholder="e.g. mechanical-keyboard"
              />
            </div>

            {/* --- NEW: MULTIPLE CATEGORY SELECTOR --- */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-yellow-500" /> Select Categories
              </label>
              <div className="flex flex-wrap gap-4 p-5 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-inner max-h-60 overflow-y-auto">
                {categories.length === 0 ? (
                  <span className="text-sm text-zinc-500 italic">No categories created yet.</span>
                ) : (
                  categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group w-full sm:w-[calc(50%-1rem)]">
                      <input
                        type="checkbox"
                        name="categoryIds"
                        value={cat.id}
                        className="w-4 h-4 accent-yellow-500 cursor-pointer rounded border-zinc-800 bg-zinc-900"
                      />
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-yellow-500 transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* PRODUCT TAGS SELECTOR */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Tags</label>
              <div className="flex flex-wrap gap-4 p-5 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-inner">
                {tags.length === 0 ? (
                  <span className="text-sm text-zinc-500 italic">No tags created yet.</span>
                ) : (
                  tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="tagIds"
                        value={tag.id}
                        className="w-4 h-4 accent-yellow-500 cursor-pointer rounded border-zinc-800 bg-zinc-900"
                      />
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-yellow-500 transition-colors">
                        {tag.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="price" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Price (LKR) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">Rs.</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    min="0"
                    required
                    className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="stock" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Inventory Stock *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="0"
                  required
                  className="flex h-12 w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 space-y-6">
            <h2 className="text-lg font-bold text-yellow-500">Media & Content</h2>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Main Thumbnail (Upload or URL)</label>
              <MainImageUploader />
            </div>

            <ProductImageManager />

            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="flex w-full rounded-xl border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all resize-y"
                placeholder="Detailed specs, features, and information..."
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Button type="submit" className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-yellow-500/20">
              <Save className="mr-2 h-5 w-5" /> Save Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}