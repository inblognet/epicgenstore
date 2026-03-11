// app/(admin)/admin/products/page.tsx
// cspell:ignore epicgenstore
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, PackageSearch } from "lucide-react";
import { revalidatePath } from "next/cache";
import { PromoToggle } from "@/components/admin/promo-toggle";
import { AdminNav } from "@/components/admin/admin-nav";
import { DeleteButton } from "@/components/admin/delete-button"; // 🚀 Import Universal Delete Button
import { redis } from "@/lib/redis"; // 🚀 Import Redis!

// FORCE DYNAMIC: Ensures the admin dashboard always pulls fresh data from the database
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 🚀 UPDATED: Secure, cache-clearing Server Action
  const deleteProduct = async (id: string) => {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    try {
      // 1. Fetch the product first so we know its slug to clear the cache!
      const productToDelete = await prisma.product.findUnique({
        where: { id },
        select: { slug: true }
      });

      // 2. Delete it from the database
      await prisma.product.delete({
        where: { id },
      });

      // 3. 🚀 CLEAR REDIS CACHES
      await redis.del("epicgenstore:homepage:data");
      await redis.del("epicgenstore:categories:filters");
      if (productToDelete?.slug) {
        await redis.del(`epicgenstore:product:${productToDelete.slug}`);
      }

      // 4. Tell Next.js to refresh
      revalidatePath("/admin/products");
      revalidatePath("/products");
      revalidatePath("/");

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to delete product. It might have orders attached to it." };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans transition-colors duration-300">

      <AdminNav />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <PackageSearch className="h-8 w-8 text-brand transition-colors duration-300" />
          Product Manager
        </h1>
        <Button asChild className="bg-brand hover:bg-brand-hover text-black font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-brand/20">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="bg-surface-card border border-zinc-800/50 rounded-xl overflow-x-auto shadow-lg transition-colors duration-300">
        <table className="w-full text-sm text-left text-zinc-300">
          <thead className="bg-surface-bg/50 border-b border-zinc-800/50 text-zinc-400 uppercase text-xs font-semibold transition-colors duration-300">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-center">Promo</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-surface-bg/50 transition-colors duration-300">

                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded bg-surface-bg border border-zinc-800/50 overflow-hidden flex-shrink-0 p-1 transition-colors duration-300">
                    {product.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-600">NO IMG</div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 font-bold text-zinc-100">
                  <span className="line-clamp-2">{product.name}</span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`font-black transition-colors duration-300 ${product.onSale ? 'text-zinc-500 line-through text-xs' : 'text-brand'}`}>
                      LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {product.onSale && product.salePrice && (
                      <span className="font-black text-red-500">
                        LKR {Number(product.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <PromoToggle
                    productId={product.id}
                    onSale={product.onSale}
                    price={Number(product.price)}
                  />
                </td>

                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                    product.stock > 0
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-surface-bg hover:text-white transition-colors duration-300">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>

                    {/* 🚀 REPLACED THE OLD HTML FORM WITH OUR NEW UNIVERSAL COMPONENT */}
                    <DeleteButton
                      id={product.id}
                      itemName="Product"
                      deleteAction={deleteProduct}
                    />

                  </div>
                </td>

              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                  No products found in the database. Add your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}