// app/(admin)/admin/products/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, PackageSearch } from "lucide-react";
import { revalidatePath } from "next/cache";
import { PromoToggle } from "@/components/admin/promo-toggle";
import { AdminNav } from "@/components/admin/admin-nav";

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

  const deleteProduct = async (id: string) => {
    "use server";
    const currentSession = await auth();
    if (currentSession?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl text-zinc-50 font-sans transition-colors duration-300">

      <AdminNav />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          {/* REPLACED: text-yellow-500 -> text-brand */}
          <PackageSearch className="h-8 w-8 text-brand transition-colors duration-300" />
          Product Manager
        </h1>
        {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover */}
        <Button asChild className="bg-brand hover:bg-brand-hover text-black font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-brand/20">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* REPLACED: bg-zinc-900 border-zinc-800 -> bg-surface-card border-zinc-800/50 */}
      <div className="bg-surface-card border border-zinc-800/50 rounded-xl overflow-x-auto shadow-lg transition-colors duration-300">
        <table className="w-full text-sm text-left text-zinc-300">
          {/* REPLACED: bg-zinc-950/50 border-zinc-800 -> bg-surface-bg/50 border-zinc-800/50 */}
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
              // REPLACED: hover:bg-zinc-800/50 -> hover:bg-surface-bg/50
              <tr key={product.id} className="hover:bg-surface-bg/50 transition-colors duration-300">

                <td className="px-6 py-4">
                  {/* REPLACED: bg-zinc-950 border-zinc-800 -> bg-surface-bg border-zinc-800/50 */}
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
                    {/* REPLACED: text-yellow-500 -> text-brand */}
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
                    {/* REPLACED: hover:bg-zinc-800 -> hover:bg-surface-bg */}
                    <Button variant="outline" size="icon" asChild className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-surface-bg hover:text-white transition-colors duration-300">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={deleteProduct.bind(null, product.id)}>
                      <Button type="submit" variant="outline" size="icon" className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
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