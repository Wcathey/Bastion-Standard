"use client";

import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  comingSoonProducts,
  sortOption,
  onSortChange,
}) {
  const totalProducts = products.length + comingSoonProducts.length;

  return (
    <div className="flex-1 p-8 ml-64">
      {/* Header with count and sort */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-white text-sm font-light">
          {totalProducts} {totalProducts === 1 ? "product" : "products"}
        </h2>

        {/* Sort Dropdown */}
        <div>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-black text-white border border-white/20 px-4 py-2 text-sm font-light focus:outline-none focus:border-white/40"
          >
            <option value="alphabetically-az">Alphabetically, A-Z</option>
            <option value="alphabetically-za">Alphabetically, Z-A</option>
            <option value="price-low-high">Price, low to high</option>
            <option value="price-high-low">Price, high to low</option>
            <option value="date-old-new">Date, old to new</option>
            <option value="date-new-old">Date, new to old</option>
          </select>
        </div>
      </div>

      {/* Available Products Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Coming Soon Section */}
      {comingSoonProducts.length > 0 && (
        <div className="mt-16 pt-16 border-t border-white/10">
          <h2 className="text-white text-2xl font-light tracking-wider uppercase mb-8">
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comingSoonProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* No Products Message */}
      {products.length === 0 && comingSoonProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/60 text-lg font-light">No products found</p>
        </div>
      )}
    </div>
  );
}
