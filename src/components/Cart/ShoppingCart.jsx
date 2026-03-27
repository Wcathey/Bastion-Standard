"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { formatAmountForDisplay } from "@/lib/stripe/client";

export default function ShoppingCart() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
    getStripeLineItems,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineItems: getStripeLineItems(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError(error.message);
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-white text-3xl font-light tracking-wider mb-4">
            YOUR CART IS EMPTY
          </h1>
          <p className="text-white/60 mb-8">
            Add some products to get started
          </p>
          <Link
            href="/products"
            className="inline-block border border-white text-white px-8 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            Shop Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl sm:text-4xl font-light tracking-wider mb-2">
            SHOPPING CART
          </h1>
          <p className="text-white/60 text-sm">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.priceId}`}
                className="bg-zinc-900 border border-white/10 p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-zinc-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white text-sm sm:text-base font-light tracking-wider uppercase">
                          {item.name}
                        </h3>
                        <p className="text-white/60 text-xs sm:text-sm mt-1">
                          {item.packSize} Pack
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(item.productId, item.priceId)
                        }
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Remove item"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.priceId,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center border border-white/20 text-white hover:border-white/40 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-white text-sm w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.priceId,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center border border-white/20 text-white hover:border-white/40 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-white text-sm sm:text-base font-light">
                          {formatAmountForDisplay(
                            item.unitAmount * item.quantity
                          )}
                        </p>
                        <p className="text-white/40 text-xs">
                          {formatAmountForDisplay(item.unitAmount)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-white/10 p-6 sticky top-24">
              <h2 className="text-white text-xl font-light tracking-wider mb-6">
                ORDER SUMMARY
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-white/80 text-sm">
                  <span>Subtotal</span>
                  <span>{formatAmountForDisplay(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-white/80 text-sm">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex justify-between text-white text-lg font-light">
                    <span>Total</span>
                    <span>{formatAmountForDisplay(getCartTotal())}</span>
                  </div>
                </div>
              </div>

              {checkoutError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 text-red-300 text-xs">
                  {checkoutError}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-white text-black px-6 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </button>

              <Link
                href="/products"
                className="block text-center text-white/60 hover:text-white text-sm mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
