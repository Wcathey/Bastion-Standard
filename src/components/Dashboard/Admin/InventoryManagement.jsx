"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function InventoryManagement() {
  const router = useRouter();
  const supabase = createClient();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchProductsAndInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProductsAndInventory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch products from Stripe API
      const productsResponse = await fetch("/api/products");
      const productsData = await productsResponse.json();

      if (!productsData.success) {
        throw new Error("Failed to fetch products");
      }

      // Filter out subscription products - they don't have pack-based inventory
      const stripeProducts = productsData.products.filter(p => !p.isSubscription);

      // Fetch inventory data from Supabase
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*");

      if (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
      }

      console.log('Stripe products:', stripeProducts);
      console.log('Inventory data:', inventoryData);

      // Merge Stripe products with inventory data
      const mergedProducts = stripeProducts.map((product) => {
        // Find all inventory items for this product (different pack sizes)
        const inventoryItems = (inventoryData || []).filter(
          (inv) => inv.stripe_product_id === product.id
        );

        // Get all available pack sizes from pricing
        const availablePackSizes = Object.keys(product.pricing || {})
          .filter(key => key.startsWith('pack_'))
          .map(key => Number.parseInt(key.replace('pack_', '')))
          .sort((a, b) => a - b);

        console.log(`Product ${product.name} has pack sizes:`, availablePackSizes);

        // Create inventory map by pack size
        const inventoryByPack = {};

        // Always create entries for all pack sizes, even if no inventory exists
        if (availablePackSizes.length === 0) {
          // If no pack sizes found, default to 1-pack
          console.log(`No pack sizes found for ${product.name}, defaulting to 1-pack`);
          availablePackSizes.push(1);
        }

        // For each available pack size, either use existing inventory or create empty record
        availablePackSizes.forEach((packSize) => {
          const existingInventory = inventoryItems.find(inv => {
            const packMatch = inv.sku?.match(/(\d+)pack/i);
            const invPackSize = packMatch ? Number.parseInt(packMatch[1]) : 1;
            return invPackSize === packSize;
          });

          if (existingInventory) {
            inventoryByPack[packSize] = existingInventory;
          } else {
            // Create placeholder for new inventory
            const priceData = product.pricing?.[`pack_${packSize}`];
            inventoryByPack[packSize] = {
              stripe_product_id: product.id,
              stripe_price_id: priceData?.priceId || null,
              stock_quantity: 0,
              available_quantity: 0,
              sku: null, // Will be generated on save
              isNew: true, // Flag to indicate this needs to be created
            };
          }
        });

        console.log(`Product ${product.name} inventoryByPack:`, inventoryByPack);

        return {
          ...product,
          inventoryByPack,
        };
      });

      console.log('Merged products:', mergedProducts);

      setProducts(mergedProducts);
    } catch (err) {
      console.error("Error fetching products and inventory:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventory = async (productId, packSize, newQuantity) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const product = products.find((p) => p.id === productId);
      const inventoryItem = product?.inventoryByPack[packSize];

      if (!inventoryItem) {
        throw new Error("Inventory item not found");
      }

      if (!inventoryItem.stripe_price_id) {
        throw new Error(
          `Missing price ID for ${product.name} ${packSize}-pack. Please ensure this product has prices configured in Stripe.`
        );
      }

      // Prepare inventory data for API
      const inventoryData = {
        stripe_product_id: inventoryItem.stripe_product_id,
        stripe_price_id: inventoryItem.stripe_price_id,
        pack_size: packSize,
        stock_quantity: newQuantity,
        product_name: product.name,
      };

      // Call API to create or update inventory
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventoryItems: [inventoryData],
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update inventory");
      }

      setSuccessMessage(result.message || "Inventory updated successfully!");

      // Refresh data
      await fetchProductsAndInventory();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating inventory:", err);
      setError(err.message || "Failed to update inventory");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuantityChange = (productId, packSize, newValue) => {
    const quantity = Number.parseInt(newValue) || 0;
    if (quantity < 0) return;

    // Update local state immediately for better UX
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const updatedInventoryByPack = { ...product.inventoryByPack };
          if (updatedInventoryByPack[packSize]) {
            updatedInventoryByPack[packSize] = {
              ...updatedInventoryByPack[packSize],
              stock_quantity: quantity,
              available_quantity: quantity,
            };
          }
          return { ...product, inventoryByPack: updatedInventoryByPack };
        }
        return product;
      })
    );
  };

  const handleSaveQuantity = async (productId, packSize) => {
    const product = products.find((p) => p.id === productId);
    const inventoryItem = product?.inventoryByPack[packSize];

    if (inventoryItem) {
      await updateInventory(productId, packSize, inventoryItem.stock_quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading inventory...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage product quantities and stock levels
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin")}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Info Message */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How to manage inventory:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Products with <span className="font-semibold">blue background</span> are new and not yet in the database</li>
          <li>Enter stock quantities for each pack size</li>
          <li>Click <span className="font-semibold">Create</span> to add new inventory records or <span className="font-semibold">Update</span> to modify existing ones</li>
          <li>SKUs are automatically generated when you create new records</li>
        </ul>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pack Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const packSizes = Object.keys(product.inventoryByPack || {}).sort(
                  (a, b) => Number(a) - Number(b)
                );

                // Always show rows for all pack sizes
                return packSizes.map((packSize, index) => {
                  const inventory = product.inventoryByPack[packSize];
                  const isNewRecord = inventory.isNew;
                  const isLowStock = !isNewRecord &&
                    inventory.available_quantity <=
                    (inventory.reorder_point || 10);
                  const isOutOfStock = inventory.available_quantity === 0;

                  return (
                    <tr key={`${product.id}-${packSize}`} className={isNewRecord ? "bg-blue-50" : ""}>
                      {index === 0 && (
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          rowSpan={packSizes.length}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.type}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {packSize}-Pack
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isNewRecord ? (
                          <span className="text-blue-600 italic">Will be generated</span>
                        ) : (
                          inventory.sku || "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                packSize,
                                Math.max(0, inventory.stock_quantity - 1)
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={inventory.stock_quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                product.id,
                                packSize,
                                e.target.value
                              )
                            }
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                packSize,
                                inventory.stock_quantity + 1
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isNewRecord ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            New - Not in DB
                          </span>
                        ) : isOutOfStock ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!inventory.stripe_price_id ? (
                          <span className="text-xs text-red-600 italic">
                            Missing price ID
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleSaveQuantity(product.id, packSize)
                            }
                            disabled={isSaving}
                            className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          >
                            {isSaving ? "Saving..." : isNewRecord ? "Create" : "Update"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
