// app/(admin)/admin/products/[id]/edit/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FolderTree } from "lucide-react"; // Added FolderTree icon
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { MainImageUploader } from "@/components/admin/main-image-uploader";

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

  // --- NEW: Added 'categories: true' to fetch the existing linked categories ---
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

  async function updateProduct(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const price = parseFloat(formData.get("price") as string);
    const imageUrl = formData.get("imageUrl") as string;
    const stock = parseInt(formData.get("stock") as string, 10);
    const description = formData.get("description") as string;

    const tagIds = formData.getAll("tagIds") as string[];
    // --- NEW: Get all checked category IDs ---
    const categoryIds = formData.getAll("categoryIds") as string[];

    const subImagesJson = formData.get("subImages") as string;
    const imagesArray: string[] = subImagesJson ? JSON.parse(subImagesJson) : [];
    const validImages = imagesArray.filter(url => url.trim() !== "");

    if (!name || !slug || isNaN(price) || isNaN(stock)) {
      throw new Error("Please fill out all required fields correctly.");
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
        // --- NEW: Update the product categories using 'set' ---
        categories: {
          set: categoryIds.map(id => ({ id }))
        }
      },
    });

    redirect("/admin/products");
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

        <form action={updateProduct} className="space-y-8">

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={product.name}
                required
                className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-xs font-black text-zinc-400 uppercase tracking-widest">URL Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                defaultValue={product.slug}
                required
                className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
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
                        // Default check if the product already belongs to this category
                        defaultChecked={product.categories.some(c => c.id === cat.id)}
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
                        defaultChecked={product.tags.some(t => t.id === tag.id)}
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
                    defaultValue={Number(product.price)}
                    step="0.01"
                    min="0"
                    required
                    className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="stock" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Inventory Stock *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  defaultValue={product.stock}
                  min="0"
                  required
                  className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 space-y-6">
            <h2 className="text-lg font-bold text-yellow-500">Media & Content</h2>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Main Thumbnail (Upload or URL)</label>
              <MainImageUploader initialUrl={product.imageUrl || ""} />
            </div>

            <ProductImageManager initialImages={product.images} />

            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-black text-zinc-400 uppercase tracking-widest">Product Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={product.description || ""}
                rows={5}
                className="flex w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all resize-y"
                placeholder="Detailed specs and information..."
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Button type="submit" className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-black text-sm uppercase tracking-widest rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-4">
              <Save className="mr-2 h-5 w-5" /> Update Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}