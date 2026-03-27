"use client";

import { useEffect, useMemo, useState } from "react";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from Stripe API and inventory from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from API...');
        const response = await fetch("/api/products");
        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('API response:', data);

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch products");
        }

        console.log(`Received ${data.products?.length || 0} products from API`);

        // Fetch inventory data from Supabase
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: inventoryData } = await supabase
          .from("inventory")
          .select("product_id, stock_quantity, available_quantity");

        console.log('Inventory data:', inventoryData);

        // Create inventory map by product_id
        const inventoryByProduct = {};
        if (inventoryData) {
          inventoryData.forEach(inv => {
            if (!inventoryByProduct[inv.product_id]) {
              inventoryByProduct[inv.product_id] = [];
            }
            inventoryByProduct[inv.product_id].push(inv);
          });
        }

        // Transform Stripe products to match the expected format
        const transformedProducts = data.products.map(product => {
          // Check inventory for this product
          const productInventory = inventoryByProduct[product.id] || [];
          const hasStock = productInventory.some(inv => inv.available_quantity > 0);
          const totalStock = productInventory.reduce((sum, inv) => sum + inv.available_quantity, 0);

          return {
            id: product.id,
            name: product.name,
            type: product.type,
            line: product.line,
            images: product.images,
            pricing: product.pricing,
            inStock: hasStock && product.active && Object.keys(product.pricing).length > 0,
            comingSoon: !hasStock || !product.active || Object.keys(product.pricing).length === 0,
            isSubscription: product.isSubscription,
            dateAdded: new Date(product.metadata?.created_at || Date.now()),
            description: product.description,
            availableStock: totalStock,
          };
        });

        console.log('Transformed products:', transformedProducts);
        console.log(`Setting ${transformedProducts.length} products to state`);

        // Filter out subscription products - they're handled separately
        const regularProducts = transformedProducts.filter(p => !p.isSubscription);
        console.log(`Filtered to ${regularProducts.length} regular products (excluding subscriptions)`);

        setAllProducts(regularProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const [filters, setFilters] = useState({
    availability: { inStock: false, outOfStock: false },
    productTypes: {},
    productLines: {},
  });

  // Update filters dynamically based on available products
  useEffect(() => {
    if (allProducts.length > 0) {
      const types = {};
      const lines = {};

      allProducts.forEach(product => {
        if (product.type) types[product.type] = false;
        if (product.line) lines[product.line] = false;
      });

      setFilters(prev => ({
        ...prev,
        productTypes: types,
        productLines: lines,
      }));
    }
  }, [allProducts]);

  const [sortOption, setSortOption] = useState("alphabetically-az");

  // Filter products
  const filteredProducts = useMemo(() => {
    console.log('Starting filter. All products:', allProducts.length);
    console.log('Filter state:', filters);

    let result = [...allProducts];

    // Apply availability filter
    const { inStock, outOfStock } = filters.availability;
    if (inStock || outOfStock) {
      console.log('Applying availability filter:', { inStock, outOfStock });
      result = result.filter((product) => {
        if (inStock && outOfStock) return true;
        if (inStock) return product.inStock;
        if (outOfStock) return !product.inStock;
        return true;
      });
      console.log('After availability filter:', result.length);
    }

    // Apply product type filter
    const selectedTypes = Object.keys(filters.productTypes).filter(
      (key) => filters.productTypes[key],
    );
    console.log('Selected types:', selectedTypes);
    if (selectedTypes.length > 0) {
      result = result.filter((product) => selectedTypes.includes(product.type));
      console.log('After type filter:', result.length);
    }

    // Apply product line filter
    const selectedLines = Object.keys(filters.productLines).filter(
      (key) => filters.productLines[key],
    );
    console.log('Selected lines:', selectedLines);
    if (selectedLines.length > 0) {
      result = result.filter((product) => selectedLines.includes(product.line));
      console.log('After line filter:', result.length);
    }

    console.log('Final filtered result:', result.length);
    return result;
  }, [filters, allProducts]);

  // Separate available and coming soon products
  const { availableProducts, comingSoonProducts } = useMemo(() => {
    console.log('Filtering products. Total products:', allProducts.length);
    console.log('After filters applied:', filteredProducts.length);

    const available = filteredProducts.filter((p) => !p.comingSoon);
    const comingSoon = filteredProducts.filter((p) => p.comingSoon);

    console.log('Available products:', available.length);
    console.log('Coming soon products:', comingSoon.length);

    return { availableProducts: available, comingSoonProducts: comingSoon };
  }, [filteredProducts, allProducts]);

  // Sort only available products (coming soon always stays at bottom)
  const sortedProducts = useMemo(() => {
    const result = [...availableProducts];

    switch (sortOption) {
      case "alphabetically-az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alphabetically-za":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-low-high":
        result.sort((a, b) => {
          const aPrice = a.pricing?.pack_1?.amount || 0;
          const bPrice = b.pricing?.pack_1?.amount || 0;
          return aPrice - bPrice;
        });
        break;
      case "price-high-low":
        result.sort((a, b) => {
          const aPrice = a.pricing?.pack_1?.amount || 0;
          const bPrice = b.pricing?.pack_1?.amount || 0;
          return bPrice - aPrice;
        });
        break;
      case "date-old-new":
        result.sort((a, b) => a.dateAdded - b.dateAdded);
        break;
      case "date-new-old":
        result.sort((a, b) => b.dateAdded - a.dateAdded);
        break;
      default:
        break;
    }

    console.log('Sorted products to render:', result.length);
    console.log('Products:', result.map(p => p.name));

    return result;
  }, [availableProducts, sortOption]);

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm tracking-wider">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <p className="text-red-400 mb-2">Error loading products</p>
          <p className="text-sm text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col md:flex-row">
      {/* Left Sidebar - Filters (hidden on mobile, shown on md+) */}
      <div className="hidden md:block">
        <ProductFilters
          onFilterChange={setFilters}
          availableTypes={filters.productTypes}
          availableLines={filters.productLines}
        />
      </div>

      {/* Right Content - Product Grid */}
      <ProductGrid
        products={sortedProducts}
        comingSoonProducts={comingSoonProducts}
        sortOption={sortOption}
        onSortChange={setSortOption}
        filters={filters}
        onFilterChange={setFilters}
        availableTypes={filters.productTypes}
        availableLines={filters.productLines}
      />
    </div>
  );
}
