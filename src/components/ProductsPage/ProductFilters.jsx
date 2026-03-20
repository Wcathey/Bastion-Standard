"use client";

import { useState } from "react";

export default function ProductFilters({ onFilterChange }) {
  const [availability, setAvailability] = useState({
    inStock: false,
    outOfStock: false,
  });

  const [productTypes, setProductTypes] = useState({
    "Simple: Crisp": false,
    "Simple: Pure": false,
    "Simple: Purify": false,
    "Hair Shampoo": false,
    "Hair Conditioner": false,
  });

  const [productLines, setProductLines] = useState({
    "Simple Line": false,
  });

  const [openSections, setOpenSections] = useState({
    availability: true,
    type: true,
    line: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAvailabilityChange = (key) => {
    const newAvailability = {
      ...availability,
      [key]: !availability[key],
    };
    setAvailability(newAvailability);
    onFilterChange({
      availability: newAvailability,
      productTypes,
      productLines,
    });
  };

  const handleProductTypeChange = (key) => {
    const newProductTypes = {
      ...productTypes,
      [key]: !productTypes[key],
    };
    setProductTypes(newProductTypes);
    onFilterChange({
      availability,
      productTypes: newProductTypes,
      productLines,
    });
  };

  const handleProductLineChange = (key) => {
    const newProductLines = {
      ...productLines,
      [key]: !productLines[key],
    };
    setProductLines(newProductLines);
    onFilterChange({
      availability,
      productTypes,
      productLines: newProductLines,
    });
  };

  return (
    <div className="fixed top-[130px] left-0 bg-black text-white w-64 h-[calc(100vh-130px)] overflow-y-auto border-r border-white/10 p-6 z-10">
      {/* Availability Section */}
      <div className="mb-8">
        <button
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between mb-4 text-sm font-light tracking-[0.2em] uppercase"
        >
          <span>AVAILABILITY</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              openSections.availability ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {openSections.availability && (
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={availability.inStock}
                onChange={() => handleAvailabilityChange("inStock")}
                className="w-4 h-4 border border-white/30 bg-transparent text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="ml-3 text-sm font-light">In stock</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={availability.outOfStock}
                onChange={() => handleAvailabilityChange("outOfStock")}
                className="w-4 h-4 border border-white/30 bg-transparent text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="ml-3 text-sm font-light">Out of stock</span>
            </label>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 mb-8"></div>

      {/* Shop By Type Section */}
      <div className="mb-8">
        <button
          onClick={() => toggleSection("type")}
          className="w-full flex items-center justify-between mb-4 text-sm font-light tracking-[0.2em] uppercase"
        >
          <span>SHOP BY TYPE</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              openSections.type ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {openSections.type && (
          <div className="space-y-3">
            {Object.keys(productTypes).map((type) => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={productTypes[type]}
                  onChange={() => handleProductTypeChange(type)}
                  className="w-4 h-4 border border-white/30 bg-transparent text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-3 text-sm font-light">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 mb-8"></div>

      {/* Shop By Line Section */}
      <div>
        <button
          onClick={() => toggleSection("line")}
          className="w-full flex items-center justify-between mb-4 text-sm font-light tracking-[0.2em] uppercase"
        >
          <span>SHOP BY LINE</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              openSections.line ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {openSections.line && (
          <div className="space-y-3">
            {Object.keys(productLines).map((line) => (
              <label key={line} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={productLines[line]}
                  onChange={() => handleProductLineChange(line)}
                  className="w-4 h-4 border border-white/30 bg-transparent text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-3 text-sm font-light">{line}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
