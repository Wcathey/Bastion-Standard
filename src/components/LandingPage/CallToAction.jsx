"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function CallToAction() {
  const [headerRef, headerVisible] = useScrollAnimation();
  const [buttonRef, buttonVisible] = useScrollAnimation(0.2);
  const [socialsRef, socialsVisible] = useScrollAnimation(0.3);
  const [newsletterRef, newsletterVisible] = useScrollAnimation();

  return (
    <section className="relative bg-zinc-950 text-white py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Decorative Background with warm glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/8 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          ref={headerRef}
          className={`transition-all duration-1000 ease-out ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            ELEVATE YOUR ROUTINE
          </h2>

          <div className="h-px w-32 bg-white mx-auto mb-12 shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>

          <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300 mb-12 max-w-4xl mx-auto">
            Your routine is more than just skincare. It's a reflection of your journey, your heritage, and your commitment to self-care. Join a community of men who refuse to settle. Who understand that excellence is not a destination—it's a standard.
          </p>
        </div>

        {/* Journal Button */}
        <div
          ref={buttonRef}
          className={`mb-12 transition-all duration-1000 ease-out delay-200 ${
            buttonVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <a
            href="/journal"
            className="inline-block bg-white text-black px-12 py-4 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:shadow-[0_0_60px_rgba(251,191,36,0.6)]"
          >
            The Bastion Journal
          </a>
        </div>

        {/* Social Icons */}
        <div
          ref={socialsRef}
          className={`flex gap-6 justify-center items-center mb-20 transition-all duration-1000 ease-out delay-300 ${
            socialsVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center border border-white w-16 h-16 hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_25px_rgba(251,191,36,0.2)] hover:shadow-[0_0_40px_rgba(251,191,36,0.4)]"
            aria-label="Instagram"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center border border-white w-16 h-16 hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_25px_rgba(251,191,36,0.2)] hover:shadow-[0_0_40px_rgba(251,191,36,0.4)]"
            aria-label="LinkedIn"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>

        <div
          ref={newsletterRef}
          className={`mt-8 pt-16 border-t border-white/20 transition-all duration-1000 ease-out delay-400 ${
            newsletterVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-sm tracking-[0.3em] text-gray-400 uppercase mb-4">
            Stay Connected
          </p>
          <p className="text-lg font-light text-gray-300 mb-8">
            Subscribe for exclusive updates and early access to new collections
          </p>
          <form className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent border border-white/30 px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors shadow-[0_0_20px_rgba(251,191,36,0.15)] focus:shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                required
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="bg-white text-black px-8 py-4 font-semibold tracking-wider uppercase hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.5)]"
                suppressHydrationWarning
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
