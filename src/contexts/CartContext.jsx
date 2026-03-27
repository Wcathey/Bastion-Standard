"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("bastion-cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("bastion-cart", JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Add item to cart
  const addToCart = (product, priceId, quantity = 1, packSize = 1) => {
    setCart((prevCart) => {
      // Check if item already exists in cart (same product and price)
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.priceId === priceId
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
        };
        return newCart;
      }

      // Item doesn't exist, add new item
      return [
        ...prevCart,
        {
          productId: product.id,
          priceId,
          name: product.name,
          image: product.images?.[0] || "/images/placeholder.png",
          packSize,
          quantity,
          unitAmount: product.pricing[`pack_${packSize}`]?.amount || 0,
        },
      ];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId, priceId) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.productId === productId && item.priceId === priceId)
      )
    );
  };

  // Update item quantity
  const updateQuantity = (productId, priceId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, priceId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.priceId === priceId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.unitAmount * item.quantity,
      0
    );
  };

  // Get cart count
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Format line items for Stripe checkout
  const getStripeLineItems = () => {
    return cart.map((item) => ({
      price: item.priceId,
      quantity: item.quantity,
    }));
  };

  const value = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getStripeLineItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
