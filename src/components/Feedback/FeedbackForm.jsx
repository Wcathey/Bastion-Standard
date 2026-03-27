"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const FEEDBACK_CATEGORIES = [
  "Feature Issue",
  "Recommendation",
  "Suggest a Feature",
  "Report a Bug",
  "Performance Issue",
  "Design/UI Feedback",
  "Other",
];

export default function FeedbackForm({ onClose }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    page_name: "",
    description: "",
  });
  const [images, setImages] = useState({
    primary: null,
    secondary: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    primary: null,
    secondary: null,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setImages((prev) => ({
      ...prev,
      [field]: file,
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field) => {
    setImages((prev) => ({
      ...prev,
      [field]: null,
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const uploadImage = async (file, fileName) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${fileName}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("feedback")
      .upload(`images/${filePath}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("feedback")
      .getPublicUrl(`images/${filePath}`);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!formData.category || !formData.description) {
        alert("Please fill in all required fields");
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Upload images if provided
      let primaryImageUrl = null;
      let secondaryImageUrl = null;

      if (images.primary) {
        const timestamp = Date.now();
        primaryImageUrl = await uploadImage(
          images.primary,
          `feedback_${timestamp}_primary`,
        );
      }

      if (images.secondary) {
        const timestamp = Date.now();
        secondaryImageUrl = await uploadImage(
          images.secondary,
          `feedback_${timestamp}_secondary`,
        );
      }

      // Insert feedback data into database
      const feedbackData = {
        user_id: user?.id || null,
        category: formData.category,
        page_name: formData.page_name || null,
        description: formData.description,
        primary_supporting_image_url: primaryImageUrl,
        secondary_supporting_image_url: secondaryImageUrl,
        status: "open",
      };

      const { error: insertError } = await supabase
        .from("feedback")
        .insert([feedbackData]);

      if (insertError) throw insertError;

      // Show success message
      alert("Thank you for your feedback! We appreciate your input.");

      // Reset form
      setFormData({ category: "", page_name: "", description: "" });
      setImages({ primary: null, secondary: null });
      setImagePreviews({ primary: null, secondary: null });

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Feedback Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          required
        >
          <option value="">Select a category</option>
          {FEEDBACK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Page Name (conditional) */}
      {formData.category && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page Name (if applicable)
          </label>
          <input
            type="text"
            value={formData.page_name}
            onChange={(e) => handleInputChange("page_name", e.target.value)}
            placeholder="e.g., Products Page, Dashboard, Checkout"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the page name where you experienced the issue or have a
            suggestion
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Please provide details about your feedback..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
          required
        />
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supporting Images (Optional - Max 2)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload screenshots or images to help us understand your feedback (Max
          5MB each)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Image */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Image 1
            </label>
            {!imagePreviews.primary ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">Click to upload</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageChange("primary", e)}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreviews.primary}
                  alt="Preview 1"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage("primary")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Secondary Image */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Image 2
            </label>
            {!imagePreviews.secondary ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">Click to upload</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageChange("secondary", e)}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreviews.secondary}
                  alt="Preview 2"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage("secondary")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
