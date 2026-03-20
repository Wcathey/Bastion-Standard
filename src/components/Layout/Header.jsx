"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AdvertisingBanner from "./AdvertisingBanner";
import Navigation from "./Navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-black border-b border-white/10">
        <div className="px-3 py-3 sm:px-6 sm:py-6">
          <div className="flex justify-between items-end gap-2 sm:gap-4 md:gap-8">
            {/* Left: Hamburger Menu Button and Logo */}
            <div className="flex items-end gap-2 sm:gap-4 md:gap-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="transition-all duration-300 mb-0.5 sm:mb-1"
                aria-label="Toggle Menu"
                suppressHydrationWarning
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 flex flex-col justify-center items-center space-y-1.5 sm:space-y-2">
                  <span
                    className={`block h-0.5 w-6 sm:w-8 bg-white transition-all duration-300 ${
                      isMenuOpen ? "rotate-45 translate-y-2 sm:translate-y-2.5" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 sm:w-8 bg-white transition-all duration-300 ${
                      isMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 sm:w-8 bg-white transition-all duration-300 ${
                      isMenuOpen ? "-rotate-45 -translate-y-2 sm:-translate-y-2.5" : ""
                    }`}
                  />
                </div>
              </button>

              <Link href="/">
                <div className="w-[60px] h-[60px] sm:w-[75px] sm:h-[75px] md:w-[92px] md:h-[92px] rounded-full bg-white flex items-center justify-center p-1.5 sm:p-2">
                  <Image
                    src="/images/landing/Black_Transparent_3016bb85-18ea-427e-99d3-f79d1601503a.png"
                    alt="Bastion Standard Company"
                    width={115}
                    height={115}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Center: Advertising Banner */}
            <div className="flex-1 mb-2 sm:mb-3 md:mb-4">
              <AdvertisingBanner />
            </div>

            {/* Right: Search, Profile and Cart Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5 mb-0.5 sm:mb-1">
              {/* Search Icon */}
              <button
                className="text-white/80 hover:text-white transition-colors hidden sm:block"
                aria-label="Search"
                suppressHydrationWarning
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Profile Icon */}
              <Link
                href="/account"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Profile"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="text-white/80 hover:text-white transition-colors relative"
                aria-label="Shopping Cart"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-white text-black text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Side Panel Navigation */}
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
