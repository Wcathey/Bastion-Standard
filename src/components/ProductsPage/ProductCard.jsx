"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { formatAmountForDisplay } from "@/lib/stripe/client";

export default function ProductCard({ product }) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Get available pack sizes from product pricing
  const getAvailablePackSizes = () => {
    if (!product.pricing) return [1];

    const sizes = Object.keys(product.pricing)
      .filter(key => key.startsWith('pack_'))
      .map(key => Number.parseInt(key.replace('pack_', '')))
      .sort((a, b) => a - b);

    return sizes.length > 0 ? sizes : [1];
  };

  const availablePackSizes = getAvailablePackSizes();

  const getPriceForQuantity = (qty) => {
    if (!product.pricing) return 0;
    return product.pricing[`pack_${qty}`]?.amount || 0;
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    try {
      if (product.isSubscription && product.pricing.subscription) {
        // Handle subscription product
        addToCart(product, product.pricing.subscription.priceId, 1, 1);
      } else {
        // Handle one-time purchase
        const priceData = product.pricing[`pack_${selectedQuantity}`];
        if (priceData) {
          addToCart(product, priceData.priceId, 1, selectedQuantity);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <div className="group relative">
      {/* Product Image - Clickable */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-zinc-900 overflow-hidden mb-4 cursor-pointer">
          {product.comingSoon && (
            <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
              <span className="text-white text-xl font-light tracking-wider">
                COMING SOON
              </span>
            </div>
          )}
          <Image
            src={product.images?.[0] || product.image || "/images/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="text-center">
        <Link href={`/products/${product.id}`} className="block hover:opacity-80 transition-opacity">
          <h3 className="text-white text-xs sm:text-sm font-light tracking-wider uppercase mb-2">
            {product.name}
          </h3>
        </Link>

        {!product.comingSoon && (
          <>
            {product.isSubscription ? (
              // Subscription Product
              <>
                <p className="text-white/80 text-xs sm:text-sm font-light mb-2">
                  {formatAmountForDisplay(product.pricing.subscription?.amount || 0)}/month
                </p>
                <p className="text-green-400 text-xs mb-3">
                  Save 10% with subscription!
                </p>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="mt-3 sm:mt-4 w-full border border-white text-white px-4 py-2 sm:px-6 text-[10px] sm:text-xs font-semibold tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
                >
                  {isAdding ? "Added!" : "Subscribe"}
                </button>
              </>
            ) : (
              // One-time Purchase Product
              <>
                {/* Quantity Dropdown */}
                <div className="mb-3">
                  <select
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                    className="bg-black text-white border border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-light focus:outline-none focus:border-white/40"
                  >
                    {availablePackSizes.map(size => (
                      <option key={size} value={size}>
                        {size} Pack
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <p className="text-white/80 text-xs sm:text-sm font-light">
                  {formatAmountForDisplay(getPriceForQuantity(selectedQuantity))}
                </p>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="mt-3 sm:mt-4 w-full border border-white text-white px-4 py-2 sm:px-6 text-[10px] sm:text-xs font-semibold tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
                >
                  {isAdding ? "Added!" : "Add to Cart"}
                </button>
              </>
            )}
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
