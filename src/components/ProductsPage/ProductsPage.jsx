"use client";

import { useMemo, useState } from "react";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";

// Product data
const allProducts = [
  {
    id: 1,
    name: "Simple: Crisp, Soap Bar",
    type: "Simple: Crisp",
    line: "Simple Line",
    image: "/images/landing/Simple_Crisp_Bar_Soap_Single.png",
    price1: 15.99,
    price2: 29.99,
    price4: 54.99,
    inStock: true,
    comingSoon: false,
    dateAdded: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Simple: Pure, Soap Bar",
    type: "Simple: Pure",
    line: "Simple Line",
    image: "/images/landing/Simple_Pure_Bar_Soap_Single.png",
    price1: 15.99,
    price2: 29.99,
    price4: 54.99,
    inStock: true,
    comingSoon: false,
    dateAdded: new Date("2024-01-20"),
  },
  {
    id: 3,
    name: "Simple: Purify, Soap Bar",
    type: "Simple: Purify",
    line: "Simple Line",
    image: "/images/landing/Simple_Purify_Soap_Bar_Single.png",
    price1: 15.99,
    price2: 29.99,
    price4: 54.99,
    inStock: true,
    comingSoon: false,
    dateAdded: new Date("2024-01-25"),
  },
  {
    id: 4,
    name: "Hair Shampoo",
    type: "Hair Shampoo",
    line: "Simple Line",
    image:
      "/images/landing/Simple_Soap_Bar_Shampoo_Conditioner_Full_Set.png",
    price1: 0,
    price2: 0,
    price4: 0,
    inStock: false,
    comingSoon: true,
    dateAdded: new Date("2024-03-01"),
  },
  {
    id: 5,
    name: "Hair Conditioner",
    type: "Hair Conditioner",
    line: "Simple Line",
    image:
      "/images/landing/Simple_Soap_Bar_Shampoo_Conditioner_Full_Set.png",
    price1: 0,
    price2: 0,
    price4: 0,
    inStock: false,
    comingSoon: true,
    dateAdded: new Date("2024-03-05"),
  },
];

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    availability: { inStock: false, outOfStock: false },
    productTypes: {
      "Simple: Crisp": false,
      "Simple: Pure": false,
      "Simple: Purify": false,
      "Hair Shampoo": false,
      "Hair Conditioner": false,
    },
    productLines: { "Simple Line": false },
  });

  const [sortOption, setSortOption] = useState("alphabetically-az");

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply availability filter
    const { inStock, outOfStock } = filters.availability;
    if (inStock || outOfStock) {
      result = result.filter((product) => {
        if (inStock && outOfStock) return true;
        if (inStock) return product.inStock;
        if (outOfStock) return !product.inStock;
        return true;
      });
    }

    // Apply product type filter
    const selectedTypes = Object.keys(filters.productTypes).filter(
      (key) => filters.productTypes[key],
    );
    if (selectedTypes.length > 0) {
      result = result.filter((product) => selectedTypes.includes(product.type));
    }

    // Apply product line filter
    const selectedLines = Object.keys(filters.productLines).filter(
      (key) => filters.productLines[key],
    );
    if (selectedLines.length > 0) {
      result = result.filter((product) => selectedLines.includes(product.line));
    }

    return result;
  }, [filters]);

  // Separate available and coming soon products
  const { availableProducts, comingSoonProducts } = useMemo(() => {
    const available = filteredProducts.filter((p) => !p.comingSoon);
    const comingSoon = filteredProducts.filter((p) => p.comingSoon);
    return { availableProducts: available, comingSoonProducts: comingSoon };
  }, [filteredProducts]);

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
        result.sort((a, b) => a.price1 - b.price1);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price1 - a.price1);
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

    return result;
  }, [availableProducts, sortOption]);

  return (
    <div className="bg-black min-h-screen flex flex-col md:flex-row">
      {/* Left Sidebar - Filters (hidden on mobile, shown on md+) */}
      <div className="hidden md:block">
        <ProductFilters onFilterChange={setFilters} />
      </div>

      {/* Right Content - Product Grid */}
      <ProductGrid
        products={sortedProducts}
        comingSoonProducts={comingSoonProducts}
        sortOption={sortOption}
        onSortChange={setSortOption}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}
