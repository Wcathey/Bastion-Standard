"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const getPriceForQuantity = (qty) => {
    const prices = {
      1: product.price1,
      2: product.price2,
      4: product.price4,
    };
    return prices[qty] || product.price1;
  };

  return (
    <div className="group relative">
      {/* Product Image */}
      <div className="relative aspect-square bg-zinc-900 overflow-hidden mb-4">
        {product.comingSoon && (
          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
            <span className="text-white text-xl font-light tracking-wider">
              COMING SOON
            </span>
          </div>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="text-center">
        <h3 className="text-white text-xs sm:text-sm font-light tracking-wider uppercase mb-2">
          {product.name}
        </h3>

        {!product.comingSoon && (
          <>
            {/* Quantity Dropdown */}
            <div className="mb-3">
              <select
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="bg-black text-white border border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-light focus:outline-none focus:border-white/40"
              >
                <option value={1}>1 Pack</option>
                <option value={2}>2 Pack</option>
                <option value={4}>4 Pack</option>
              </select>
            </div>

            {/* Price */}
            <p className="text-white/80 text-xs sm:text-sm font-light">
              ${getPriceForQuantity(selectedQuantity).toFixed(2)}
            </p>

            {/* Add to Cart Button */}
            <button
              type="button"
              className="mt-3 sm:mt-4 w-full border border-white text-white px-4 py-2 sm:px-6 text-[10px] sm:text-xs font-semibold tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300"
            >
              Add to Cart
            </button>
          </>
        )}

        {product.comingSoon && (
          <p className="text-white/60 text-xs sm:text-sm font-light italic">
            Available Soon
          </p>
        )}
      </div>
    </div>
  );
}
