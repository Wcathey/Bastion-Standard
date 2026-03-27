"use client";

import { useState } from "react";
import { FAQ_CATEGORIES } from "./FAQData";

export default function FAQQuestions({ selectedCategory }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedQuestions({
      ...expandedQuestions,
      [key]: !expandedQuestions[key],
    });
  };

  return (
    <div className="space-y-3">
      {FAQ_CATEGORIES[selectedCategory].questions.map((faq, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleQuestion(selectedCategory, index)}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
          >
            <span className="font-medium text-gray-900">{faq.q}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
                expandedQuestions[`${selectedCategory}-${index}`]
                  ? "transform rotate-180"
                  : ""
              }`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {expandedQuestions[`${selectedCategory}-${index}`] && (
            <div className="px-6 pb-4 pt-2 text-sm text-gray-600 border-t">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
