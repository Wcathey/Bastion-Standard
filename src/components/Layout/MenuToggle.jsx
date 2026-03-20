"use client";

import { useState } from "react";
import Navigation from "./Navigation";

export default function MenuToggle() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Fixed Hamburger Menu Button - positioned at same level as logo */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 left-28 z-[90] p-3 bg-black/90 backdrop-blur-sm border border-white/30 hover:bg-black hover:border-white/50 transition-all duration-300 shadow-lg"
        aria-label="Toggle Menu"
      >
        <div className="w-7 h-7 flex flex-col justify-center items-center space-y-1.5">
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>
      </button>

      {/* Side Panel Navigation */}
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
