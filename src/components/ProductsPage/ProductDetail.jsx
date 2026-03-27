"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

// Product descriptions (typed content preserved from landing page)
const productDescriptions = {
  "Simple: Crisp": {
    tagline: "Refreshing. Energizing. Bold.",
    description:
      "Infused with eucalyptus and spearmint, Simple: Crisp delivers a refreshing cleanse that wakes up your skin and senses. Designed for men of color, this bar hydrates while deeply purifying, making every wash a bold act of self-care.",
    keyBenefits: [
      "Deep cleanse that preserves skin's natural moisture",
      "Eucalyptus + spearmint refresh and energize",
      "Nourishing formula supports clear, healthy skin",
    ],
    scentProfile:
      "Bright, cooling, and revitalizing, a crisp blend of eucalyptus and spearmint",
    valueStatement:
      "For those who value: energy, clarity, and intentional self-renewal",
  },
  "Simple: Pure": {
    tagline: "Clean. Balanced. Essential.",
    description:
      "Crafted for men of color, Simple: Pure is a fragrance-free soap bar that gently cleanses without stripping your skin. Made without unnecessary additives, it delivers a rich lather and lasting hydration, perfect for sensitive or minimalist routines.",
    keyBenefits: [
      "Gentle, non-drying cleanse",
      "Fragrance- and dye-free",
      "Hypoallergenic and ideal for sensitive skin",
      "Designed specifically for men of color",
    ],
    scentProfile: "",
    valueStatement:
      "For those who value simplicity, performance, and skin-first standards.",
  },
  "Simple: Purify": {
    tagline: "Detoxifying. Renewing. Pure.",
    description:
      "Formulated for men of color, Simple: Purify uses Kaolin clay and tea tree oil to gently draw out impurities, calm irritation, and hydrate your skin. The result: a smooth, balanced complexion with minimal effort.",
    keyBenefits: [
      "Kaolin clay detoxifies without stripping moisture",
      "Tea tree oil soothes and refreshes",
      "Hydrating formula supports clear, even skin",
    ],
    scentProfile: "Clean, earthy, and grounded with subtle tea tree notes",
    valueStatement:
      "For those who value: clarity, balance, and elevated simplicity",
  },
};

// Helper function to get the base product name for description matching
function getBaseProductName(fullName) {
  // Extract the base name (e.g., "Simple: Crisp Soap Bar" -> "Simple: Crisp")
  const match = fullName.match(/^(Simple: \w+)/);
  return match ? match[1] : fullName;
}

export default function ProductDetail({ productId }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Looking for product with ID:', productId);
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch products");
        }

        console.log('Available products:', data.products.map(p => ({ id: p.id, name: p.name })));

        // Find the specific product by ID
        const foundProduct = data.products.find((p) => p.id === productId);

        console.log('Found product:', foundProduct);

        if (!foundProduct) {
          throw new Error("Product not found");
        }

        // Fetch inventory data from Supabase
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: inventoryData } = await supabase
          .from("inventory")
          .select("product_id, stock_quantity, available_quantity, sku")
          .eq("product_id", productId);

        console.log('Inventory data for product:', inventoryData);

        // Create inventory map by pack size
        const inventoryByPack = {};
        if (inventoryData) {
          inventoryData.forEach(inv => {
            // Extract pack size from SKU (e.g., "simple-crisp-2pack" -> 2)
            const packMatch = inv.sku?.match(/(\d+)pack/i);
            const packSize = packMatch ? Number.parseInt(packMatch[1]) : 1;
            inventoryByPack[packSize] = inv;
          });
        }

        // Check if product has stock
        const hasStock = inventoryData && inventoryData.some(inv => inv.available_quantity > 0);

        setProduct({
          ...foundProduct,
          inStock: hasStock,
          inventoryByPack,
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    const priceData = product.pricing[`pack_${selectedQuantity}`];
    if (priceData) {
      addToCart(product, priceData.priceId, 1, selectedQuantity);
      // Optional: Show success message or redirect to cart
      router.push("/cart");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm tracking-wider">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <p className="text-red-400 mb-4">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => router.push("/products")}
            className="border border-white px-6 py-2 text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Get the description data for this product
  const baseName = getBaseProductName(product.name);
  const descriptionData = productDescriptions[baseName] || {};

  // Get available pack sizes
  const availablePacks = Object.keys(product.pricing)
    .filter((key) => key.startsWith("pack_"))
    .map((key) => {
      const quantity = Number.parseInt(key.split("_")[1]);
      return {
        quantity,
        ...product.pricing[key],
      };
    })
    .sort((a, b) => a.quantity - b.quantity);

  const selectedPrice = product.pricing[`pack_${selectedQuantity}`];

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push("/products")}
          className="mb-8 text-sm tracking-wider text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Products
        </button>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="relative aspect-square">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5 border border-white/10">
                <span className="text-white/40 text-sm">No image available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Tagline */}
            {descriptionData.tagline && (
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4 uppercase">
                {descriptionData.tagline}
              </p>
            )}

            {/* Product Name */}
            <h1 className="text-4xl sm:text-5xl font-light tracking-wider mb-6">
              {product.name}
            </h1>

            <div className="h-px w-16 bg-white mb-8"></div>

            {/* Description */}
            {descriptionData.description && (
              <p className="text-base md:text-lg font-light leading-relaxed text-gray-300 mb-8">
                {descriptionData.description}
              </p>
            )}

            {/* Key Benefits */}
            {descriptionData.keyBenefits &&
              descriptionData.keyBenefits.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.2em] text-white mb-4 uppercase font-semibold">
                    Key Benefits:
                  </h3>
                  <ul className="space-y-2 text-sm md:text-base font-light text-gray-300">
                    {descriptionData.keyBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-amber-600 mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Scent Profile */}
            {descriptionData.scentProfile && (
              <div className="mb-8">
                <h3 className="text-sm tracking-[0.2em] text-white mb-3 uppercase font-semibold">
                  Scent Profile:
                </h3>
                <p className="text-sm md:text-base font-light italic text-gray-300">
                  {descriptionData.scentProfile}
                </p>
              </div>
            )}

            {/* Value Statement */}
            {descriptionData.valueStatement && (
              <p className="text-sm md:text-base font-light italic text-gray-400 mb-8">
                {descriptionData.valueStatement}
              </p>
            )}

            <div className="border-t border-white/10 pt-8">
              {/* Pack Size Selection */}
              {availablePacks.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm tracking-wider uppercase mb-3">
                    Select Pack Size:
                  </label>
                  <div className="flex gap-3">
                    {availablePacks.map((pack) => {
                      const inventory = product.inventoryByPack?.[pack.quantity];
                      const packStock = inventory?.available_quantity || 0;
                      const isPackOutOfStock = packStock === 0;

                      return (
                        <button
                          key={pack.quantity}
                          onClick={() => !isPackOutOfStock && setSelectedQuantity(pack.quantity)}
                          disabled={isPackOutOfStock}
                          className={`flex-1 border py-3 px-4 text-sm tracking-wider transition-all duration-300 ${
                            selectedQuantity === pack.quantity
                              ? "border-white bg-white text-black"
                              : isPackOutOfStock
                                ? "border-white/20 opacity-50 cursor-not-allowed"
                                : "border-white/30 hover:border-white/60"
                          }`}
                        >
                          {pack.quantity}-Pack
                          <div className="text-xs mt-1">
                            ${(pack.amount / 100).toFixed(2)}
                          </div>
                          {inventory && (
                            <div className={`text-xs mt-1 ${isPackOutOfStock ? 'text-red-400' : 'text-green-400'}`}>
                              {isPackOutOfStock ? 'Out of Stock' : `${packStock} available`}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price */}
              {selectedPrice && (
                <div className="mb-6">
                  <p className="text-3xl font-light tracking-wider">
                    ${(selectedPrice.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    ${((selectedPrice.amount / 100) / selectedQuantity).toFixed(2)} per bar
                  </p>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedPrice || (product.inventoryByPack?.[selectedQuantity]?.available_quantity || 0) === 0}
                className="w-full bg-white text-black py-4 px-8 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(product.inventoryByPack?.[selectedQuantity]?.available_quantity || 0) === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              {/* Stock Status */}
              {product.inStock ? (
                <p className="text-sm text-green-400 mt-4 text-center">
                  In Stock
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-4 text-center">
                  Coming Soon
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
