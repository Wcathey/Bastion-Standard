"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Newsletter signup logic will be implemented later
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="bg-black text-white py-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mr-auto px-4 sm:px-6 lg:px-8 ml-64">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Welcome Section */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] mb-6 uppercase">
              Welcome to the Standard
            </h3>
            <p className="text-sm mb-6 leading-relaxed">
              Unlock exclusive offers, updates, and the latest in grooming
              rituals for those who elevate their routine.
            </p>

            {/* Email Signup */}
            <form onSubmit={handleNewsletterSubmit} className="mb-8">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent border-b border-white pb-2 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                  required
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-2"
                  aria-label="Subscribe"
                  suppressHydrationWarning
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Main Menu */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] mb-6 uppercase">
              Main Menu
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:opacity-70 transition-opacity">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:opacity-70 transition-opacity"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs/news"
                  className="hover:opacity-70 transition-opacity"
                >
                  The Bastion Journal
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/about-us"
                  className="hover:opacity-70 transition-opacity"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/connect"
                  className="hover:opacity-70 transition-opacity uppercase tracking-wider"
                >
                  Connect With Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] mb-6 uppercase">
              Connect With Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/pages/customer-service"
                  className="hover:opacity-70 transition-opacity uppercase tracking-wider"
                >
                  Customer Service
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/partnership-opportunities"
                  className="hover:opacity-70 transition-opacity uppercase tracking-wider"
                >
                  Partnership Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/wholesale-inquiries"
                  className="hover:opacity-70 transition-opacity uppercase tracking-wider"
                >
                  Wholesale Inquiries
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/brand-ambassadors"
                  className="hover:opacity-70 transition-opacity uppercase tracking-wider"
                >
                  Brand Ambassadors
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/privacy-choices"
                  className="hover:opacity-70 transition-opacity"
                >
                  Your Privacy Choices
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
