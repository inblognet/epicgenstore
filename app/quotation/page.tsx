// app/quotation/page.tsx
import { prisma } from "@/lib/prisma";
import { QuotationBuilder } from "@/components/client/quotation-builder";

export const metadata = {
  title: "Custom PC Quotation | EPIC STORE",
  description: "Build your custom PC and get an instant quotation.",
};

export default async function QuotationPage() {
  // 1. Fetch all categories and include their products
  const rawCategories = await prisma.category.findMany({
    include: {
      products: {
        where: { stock: { gt: 0 } }, // Only show in-stock items
        orderBy: { price: 'asc' },
      }
    },
    orderBy: { name: 'asc' }
  });

  // 2. Filter out empty categories AND convert Prisma Decimals to standard JS numbers
  const validCategories = rawCategories
    .filter(cat => cat.products.length > 0)
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      products: cat.products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        // Convert Prisma Decimal to standard JS number
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        imageUrl: product.imageUrl,
        stock: product.stock,
      }))
    }));

  return (
    <div className="min-h-screen bg-surface-bg text-theme-main py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="mb-8 border-b border-theme-border pb-6">
          <h1 className="text-4xl font-black tracking-tight text-theme-main">Get a Quotation</h1>
          <p className="text-theme-muted mt-2">Select products to your perfect generate a quotation.</p>
        </div>

        {/* Pass the fully converted, safe data to our interactive client component */}
        <QuotationBuilder categories={validCategories} />
      </div>
    </div>
  );
}