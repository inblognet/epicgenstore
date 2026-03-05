// components/client/quotation-builder.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, X, ShoppingCart, Download } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useRouter } from "next/navigation";

// Types based on the data we fetched in the server component
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  stock: number;
};

type Category = {
  id: string;
  name: string;
  products: Product[];
};

export function QuotationBuilder({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { addItem } = useCartStore();

  // State to track which category is currently clicked/active
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || "");

  // State to track the selected product for each category slot
  const [selectedParts, setSelectedParts] = useState<Record<string, Product>>({});

  // State for the right-side search bar
  const [searchQuery, setSearchQuery] = useState("");

  // Get the currently active category object
  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  // Filter the products of the active category based on the search query
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];
    if (!searchQuery) return activeCategory.products;
    return activeCategory.products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  // Calculate total price of all selected parts
  const totalPrice = useMemo(() => {
    return Object.values(selectedParts).reduce((total, part) => {
      const activePrice = part.salePrice ? Number(part.salePrice) : Number(part.price);
      return total + activePrice;
    }, 0);
  }, [selectedParts]);

  // Action: Select a part for the active category
  const handleSelectPart = (categoryId: string, product: Product) => {
    setSelectedParts((prev) => ({ ...prev, [categoryId]: product }));
    // Optional: Auto-advance to the next category
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex < categories.length - 1) {
      setActiveCategoryId(categories[currentIndex + 1].id);
      setSearchQuery(""); // Clear search for next category
    }
  };

  // Action: Remove a selected part
  const handleRemovePart = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the category card
    setSelectedParts((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  };

  // Action: Add all selected items to cart
  const handleAddAllToCart = () => {
    const parts = Object.values(selectedParts);
    if (parts.length === 0) return alert("Please select at least one component.");

    parts.forEach((part) => {
      const activePrice = part.salePrice ? Number(part.salePrice) : Number(part.price);
      addItem({
        id: part.id,
        name: part.name,
        slug: part.slug,
        price: activePrice,
        imageUrl: part.imageUrl,
        quantity: 1,
      });
    });

    router.push("/cart"); // Redirect to cart after adding
  };

  // FIXED Action: Open the custom Print Quotation page with item IDs in the URL
  const handleDownload = () => {
    // Grab all the IDs of the products the user selected
    const itemIds = Object.values(selectedParts).map((p) => p.id).join(',');

    if (!itemIds) {
      return alert("Please select at least one component to generate a quotation.");
    }

    // Open the print page in a new tab, passing the IDs in the URL
    window.open(`/quotation/print?items=${itemIds}`, '_blank');
  };

  if (categories.length === 0) return <div>No categories available for builder.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[70vh]">

      {/* LEFT COLUMN: CATEGORY SLOTS */}
      <div className="w-full lg:w-1/3 flex flex-col gap-3">
        {categories.map((cat) => {
          const isSelected = activeCategoryId === cat.id;
          const selectedPart = selectedParts[cat.id];

          return (
            <div
              key={cat.id}
              onClick={() => {
                setActiveCategoryId(cat.id);
                setSearchQuery("");
              }}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                isSelected
                  ? "border-brand bg-brand/5 shadow-md ring-1 ring-brand"
                  : "border-theme-border bg-surface-card hover:border-theme-muted"
              }`}
            >
              <h3 className={`font-black text-sm uppercase tracking-wider mb-2 ${isSelected ? "text-brand" : "text-theme-main"}`}>
                {cat.name}
              </h3>

              {selectedPart ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-theme-main font-medium line-clamp-2 leading-tight">
                      {selectedPart.name}
                    </span>
                    <span className="text-sm font-bold text-brand mt-1">
                      Rs. {(selectedPart.salePrice || selectedPart.price).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleRemovePart(cat.id, e)}
                    className="text-theme-muted hover:text-red-500 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-theme-muted italic">Click to choose</p>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT COLUMN: PRODUCT SELECTION & TOTALS */}
      <div className="w-full lg:w-2/3 flex flex-col h-[70vh]">

        {/* Search Bar for active category */}
        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
          <input
            type="text"
            placeholder={`Search ${activeCategory?.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-surface-card border border-theme-border rounded-xl pl-12 pr-4 text-theme-main focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Scrollable Product List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-theme-muted border border-theme-border border-dashed rounded-xl">
              No products found in this category.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const price = product.salePrice ? Number(product.salePrice) : Number(product.price);
              const isCurrentlySelected = selectedParts[activeCategoryId]?.id === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectPart(activeCategoryId, product)}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isCurrentlySelected
                      ? "border-brand bg-brand/10"
                      : "border-theme-border bg-surface-card hover:border-theme-muted/50"
                  }`}
                >
                  {/* Small Product Image */}
                  <div className="w-16 h-16 shrink-0 bg-surface-bg rounded-lg overflow-hidden border border-theme-border flex items-center justify-center p-1">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-theme-muted">No Img</span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-theme-main line-clamp-2 leading-snug">{product.name}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-black text-brand">Rs. {price.toLocaleString()}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                        In Stock ({product.stock})
                      </span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isCurrentlySelected ? "border-brand bg-brand" : "border-theme-muted"
                  }`}>
                    {isCurrentlySelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM TOTALS BAR */}
        <div className="mt-6 p-6 border-t-4 border-brand bg-surface-card rounded-xl shrink-0 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-sm text-theme-muted font-bold uppercase tracking-wider">Estimated Total</span>
            <span className="text-3xl font-black text-theme-main">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none h-12 px-6 border border-theme-border text-theme-main hover:text-brand hover:border-brand font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={handleAddAllToCart}
              className="flex-1 sm:flex-none h-12 px-8 bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" /> Add All
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}