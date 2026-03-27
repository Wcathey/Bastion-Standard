"use client";

import { useState } from "react";
import FAQCategories from "./FAQCategories";
import FAQQuestions from "./FAQQuestions";

export default function FAQContent() {
  const [selectedCategory, setSelectedCategory] = useState("orders");

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <FAQCategories
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <FAQQuestions selectedCategory={selectedCategory} />
    </div>
  );
}
