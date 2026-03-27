"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FeedbackModal from "../Feedback/FeedbackModal";

// Helper function to get time-based greeting
function _getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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
      { name: "DIOLY'S STORY", href: "/our-story" },
      { name: "THE BASTION FORMULAS", href: "/bastion-formulas" },
      { name: "FAQS", href: "/faqs" },
    ],
  },
  {
    name: "CONNECT WITH US",
    href: "/connect",
    hasDropdown: true,
    subItems: [
      { name: "EVENTS", href: "/events" },
      { name: "INQUIRY FORM", href: "/inquiry" },
      { name: "SUBMIT FEEDBACK", href: "#feedback", special: "feedback" },
      { name: "CUSTOMER SERVICE", href: "/customer-service" },
      { name: "PARTNERSHIP OPPORTUNITIES", href: "/partnerships" },
      { name: "WHOLESALE INQUIRIES", href: "/wholesale" },
      { name: "BRAND AMBASSADORS", href: "/ambassadors" },
    ],
  },
];

export default function Navigation({ isOpen, onClose }) {
  const router = useRouter();
  const supabase = createClient();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [_account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if user is an admin first
        const { data: adminData } = await supabase
          .from("admin_accounts")
          .select("first_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminData) {
          setAccount(adminData);
        } else {
          // Not an admin, check customer accounts table
          const { data: accountData } = await supabase
            .from("customer_accounts")
            .select("first_name")
            .eq("user_id", user.id)
            .maybeSingle();
          setAccount(accountData);
        }
      } else {
        // No user, clear account data
        setAccount(null);
      }
    };

    // Check user on mount
    checkUser();

    // Listen for auth state changes (login, logout, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === "SIGNED_OUT") {
        // User logged out - clear user and account state
        setUser(null);
        setAccount(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // User logged in or session refreshed - recheck user
        checkUser();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

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

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setAccount(null);
      onClose();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      alert("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
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
          {/* Header with Logo and Close Button */}
          <div className="border-b border-white/10">
            {/* Logo and Close Button Row */}
            <div className="flex justify-between items-start px-5 pt-5 pb-5">
              <Link href="/" onClick={onClose}>
                <div className="w-[100px] h-[100px] rounded-full bg-white flex items-center justify-center p-2">
                  <Image
                    src="/images/landing/Black_Transparent_3016bb85-18ea-427e-99d3-f79d1601503a.png"
                    alt="Bastion Standard Company"
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
              <button
                onClick={onClose}
                className="p-2"
                aria-label="Close Menu"
                suppressHydrationWarning
              >
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
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-5 py-6 overflow-y-auto">
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
                        className="w-full flex items-center justify-between text-white hover:text-gray-300 text-left font-light tracking-wider text-base uppercase py-2 transition-colors"
                        suppressHydrationWarning
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
                        className="block text-white hover:text-gray-300 font-light tracking-wider text-base uppercase py-2 transition-colors"
                      >
                        {item.name}
                      </Link>
                    )}

                    {/* Dropdown Items */}
                    {item.subItems && openDropdown === item.name && (
                      <div className="mt-4 ml-0 flex flex-col space-y-3">
                        {item.subItems.map((subItem) =>
                          subItem.special === "feedback" ? (
                            <button
                              key={subItem.name}
                              onClick={() => {
                                setIsFeedbackModalOpen(true);
                                onClose();
                              }}
                              className="text-white hover:text-gray-300 font-light tracking-wide text-sm uppercase py-1 text-left transition-colors"
                            >
                              {subItem.name}
                            </button>
                          ) : (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={onClose}
                              className="text-white hover:text-gray-300 font-light tracking-wide text-sm uppercase py-1 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Final divider after last item */}
              <div className="border-t border-white" />
            </div>

            {/* User Email */}
            {user && (
              <div className="mt-10 mb-4">
                <span className="text-gray-300 text-sm font-light tracking-wide">
                  {user.email}
                </span>
              </div>
            )}

            {/* Login/Logout Link */}
            <div className="mb-8">
              {user ? (
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="block text-red-500 hover:text-red-400 font-light text-base tracking-wide disabled:opacity-50 transition-colors"
                >
                  {loading ? "Signing out..." : "Log out"}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block text-white hover:text-gray-300 font-light text-base tracking-wide transition-colors"
                >
                  Log in
                </Link>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 transition-opacity shadow-lg"
                aria-label="Instagram"
              >
                <svg
                  className="w-7 h-7 text-white"
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
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-7 h-7 text-white"
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </>
  );
}
