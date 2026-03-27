"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImage } from "@/lib/supabase/storage";
import Image from "next/image";

export default function NewProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productType: "one-time",
    metadata: {
      type: "",
      line: "Simple Line",
    },
  });

  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [prices, setPrices] = useState([
    { quantity: 1, amount: 0, nickname: "Single Pack" },
  ]);

  const handleAddPrice = () => {
    setPrices([
      ...prices,
      { quantity: prices.length + 1, amount: 0, nickname: "" },
    ]);
  };

  const handleRemovePrice = (index) => {
    if (prices.length > 1) {
      setPrices(prices.filter((_, i) => i !== index));
    }
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...prices];
    newPrices[index] = {
      ...newPrices[index],
      [field]: field === "amount" ? Number.parseInt(value * 100) : value,
    };
    setPrices(newPrices);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const selectedFiles = files.slice(0, 5);
    setProductImages(selectedFiles);

    // Create preview URLs
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = productImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke the removed preview URL
    URL.revokeObjectURL(imagePreviews[index]);

    setProductImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // First, create the product in Stripe
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          images: [], // Images will be uploaded to Supabase Storage
          metadata: formData.metadata,
          prices: prices.map(p => ({
            quantity: Number.parseInt(p.quantity),
            amount: Number.parseInt(p.amount),
            nickname: p.nickname,
          })),
          isSubscription: formData.productType === "subscription",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      // Upload images to Supabase Storage if any
      if (productImages.length > 0 && data.product?.id) {
        setUploadingImages(true);

        try {
          await Promise.all(
            productImages.map((image, index) =>
              uploadProductImage(data.product.id, image, index)
            )
          );
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          // Don't fail the whole operation if images fail
          // The product was still created successfully
        }
      }

      // Clean up preview URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));

      // Redirect back to dashboard
      router.push("/dashboard/admin");
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Product
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new product in Stripe and add it to your store
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                placeholder="Simple: Crisp, Soap Bar"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                placeholder="Describe your product..."
              />
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>

              {/* Image Upload */}
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB (max 5 images)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Product Type
              </label>
              <input
                type="text"
                id="type"
                value={formData.metadata.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, type: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                placeholder="Simple: Crisp"
              />
            </div>

            {/* Product Line */}
            <div>
              <label
                htmlFor="line"
                className="block text-sm font-medium text-gray-700"
              >
                Product Line
              </label>
              <input
                type="text"
                id="line"
                value={formData.metadata.line}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, line: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
              />
            </div>

            {/* Pricing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type *
              </label>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="one-time"
                    checked={formData.productType === "one-time"}
                    onChange={(e) =>
                      setFormData({ ...formData, productType: e.target.value })
                    }
                    className="form-radio"
                  />
                  <span className="ml-2">One-time Purchase (with pack options)</span>
                </label>
                <label className="inline-flex items-center ml-6">
                  <input
                    type="radio"
                    value="subscription"
                    checked={formData.productType === "subscription"}
                    onChange={(e) =>
                      setFormData({ ...formData, productType: e.target.value })
                    }
                    className="form-radio"
                  />
                  <span className="ml-2">Subscription (recurring payment)</span>
                </label>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Pricing Tiers *
                </label>
                {formData.productType === "one-time" && (
                  <button
                    type="button"
                    onClick={handleAddPrice}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Pack Size
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {prices.map((price, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-3 border border-gray-200 rounded-md"
                  >
                    {formData.productType === "one-time" ? (
                      <>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">
                            Pack Size
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={price.quantity}
                            onChange={(e) =>
                              handlePriceChange(index, "quantity", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-2 py-1 border"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price.amount / 100}
                            onChange={(e) =>
                              handlePriceChange(index, "amount", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-2 py-1 border"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Monthly Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={price.amount / 100}
                          onChange={(e) =>
                            handlePriceChange(index, "amount", e.target.value)
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-2 py-1 border"
                        />
                      </div>
                    )}
                    {prices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePrice(index)}
                        className="mt-6 text-red-600 hover:text-red-700"
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
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error creating product
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingImages}
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {uploadingImages
                  ? "Uploading images..."
                  : isSubmitting
                    ? "Creating..."
                    : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
