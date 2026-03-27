"use client";

import { FAQ_CATEGORIES } from "./FAQData";

export default function FAQCategories({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
        <button
          key={key}
          onClick={() => onCategoryChange(key)}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === key
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}
