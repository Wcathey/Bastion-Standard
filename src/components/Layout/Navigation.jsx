"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navigationItems = [
  {
    name: "HOME",
    href: "/",
  },
  {
    name: "PRODUCTS",
    href: "/products",
  },
  {
    name: "THE BASTION JOURNAL",
    href: "/journal",
  },
  {
    name: "ABOUT US",
    href: "/about",
    hasDropdown: true,
    subItems: [
      { name: "OUR STORY", href: "/our-story" },
      { name: "THE BASTION FORMULAS", href: "/bastion-formulas" },
      { name: "FAQS", href: "/faqs" },
    ],
  },
  {
    name: "CONNECT WITH US",
    href: "/connect",
    hasDropdown: true,
    subItems: [
      { name: "INQUIRY FORM", href: "/inquiry" },
      { name: "CUSTOMER SERVICE", href: "/customer-service" },
      { name: "PARTNERSHIP OPPORTUNITIES", href: "/partnerships" },
      { name: "WHOLESALE INQUIRIES", href: "/wholesale" },
      { name: "BRAND AMBASSADORS", href: "/ambassadors" },
    ],
  },
];

export default function Navigation({ isOpen, onClose }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleDropdown = (itemName) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-500 z-50 ${
          isOpen ? "opacity-70 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel - Slides from LEFT */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[350px] bg-black shadow-2xl transform transition-transform duration-500 ease-in-out z-[100] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Close Button */}
          <div className="flex justify-end px-5 pt-5 pb-3">
            <button onClick={onClose} className="p-2" aria-label="Close Menu">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-5 py-8 overflow-y-auto">
            <div className="flex flex-col">
              {navigationItems.map((item, _index) => (
                <div key={item.name}>
                  {/* Divider */}
                  <div className="border-t border-white mb-6" />

                  {/* Main Link */}
                  <div className="mb-6">
                    {item.hasDropdown ? (
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="w-full flex items-center justify-between text-white text-left font-light tracking-wider text-base uppercase py-2"
                      >
                        <span>{item.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${
                            openDropdown === item.name ? "rotate-180" : ""
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
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block text-white font-light tracking-wider text-base uppercase py-2"
                      >
                        {item.name}
                      </Link>
                    )}

                    {/* Dropdown Items */}
                    {item.subItems && openDropdown === item.name && (
                      <div className="mt-4 ml-0 flex flex-col space-y-3">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={onClose}
                            className="text-white font-light tracking-wide text-sm uppercase py-1"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Final divider after last item */}
              <div className="border-t border-white" />
            </div>

            {/* Login Link */}
            <div className="mt-10 mb-8">
              <Link
                href="/login"
                onClick={onClose}
                className="block text-white font-light text-base tracking-wide"
              >
                Log in
              </Link>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-2 gap-0 max-w-[232px]">
              {/* Instagram */}
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center border border-white h-12"
                aria-label="Instagram"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center border border-white border-l-0 h-12"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
