/**
 * Supabase Storage Helper Functions
 *
 * Handles product image uploads and retrieval from Supabase Storage.
 * Images are organized by product ID: products/{stripe_product_id}/image.png
 */

import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "products";

/**
 * Upload a product image to Supabase Storage
 * @param {string} productId - Stripe product ID
 * @param {File} file - Image file to upload
 * @param {number} index - Image index (for multiple images)
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadProductImage(productId, file, index = 0) {
  const supabase = createClient();

  // Generate file path: products/{productId}/image-{index}.{ext}
  const fileExt = file.name.split(".").pop();
  const fileName = `image-${index}.${fileExt}`;
  const filePath = `${productId}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Replace if exists
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Get all images for a product
 * @param {string} productId - Stripe product ID
 * @returns {Promise<string[]>} Array of public URLs
 */
export async function getProductImages(productId) {
  const supabase = createClient();

  // List all files in product folder
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(productId, {
      limit: 10,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error(`Error fetching images for ${productId}:`, error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get public URLs for all images
  const urls = data.map((file) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${productId}/${file.name}`);
    return urlData.publicUrl;
  });

  return urls;
}

/**
 * Delete a product image
 * @param {string} filePath - Full path to file (e.g., "prod_123/image-0.png")
 * @returns {Promise<boolean>}
 */
export async function deleteProductImage(filePath) {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }

  return true;
}

/**
 * Delete all images for a product
 * @param {string} productId - Stripe product ID
 * @returns {Promise<boolean>}
 */
export async function deleteAllProductImages(productId) {
  const supabase = createClient();

  // List all files
  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .list(productId);

  if (!data || data.length === 0) {
    return true;
  }

  // Delete all files
  const filePaths = data.map((file) => `${productId}/${file.name}`);
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (error) {
    throw new Error(`Batch delete failed: ${error.message}`);
  }

  return true;
}

/**
 * Check if storage bucket exists and is accessible
 * @returns {Promise<boolean>}
 */
export async function checkStorageBucket() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { limit: 1 });

    return !error;
  } catch (error) {
    console.error("Storage bucket check failed:", error);
    return false;
  }
}
