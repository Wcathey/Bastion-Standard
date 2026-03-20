"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Link from "next/link";

export default function BrandPhilosophy() {
  const [titleRef, titleVisible] = useScrollAnimation();
  const [quoteRef, quoteVisible] = useScrollAnimation(0.15);
  const [contentRef, contentVisible] = useScrollAnimation(0.2);

  return (
    <section className="relative bg-black text-white py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] md:w-[900px] md:h-[900px] bg-amber-600/8 rounded-full blur-[100px] sm:blur-[120px] md:blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div
          ref={titleRef}
          className={`text-center mb-8 sm:mb-10 transition-all duration-1000 ease-out ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            THE BASTION WAY
          </h2>
          <div className="h-px w-24 sm:w-32 bg-white mx-auto shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
        </div>

        {/* Quote */}
        <div
          ref={quoteRef}
          className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ease-out ${
            quoteVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide italic text-gray-200 max-w-5xl mx-auto leading-relaxed drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]">
            "When you invest in yourself, you invest in your legacy."
          </blockquote>
        </div>

        {/* Content Grid */}
        <div
          ref={contentRef}
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16 transition-all duration-1000 ease-out ${
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* For Men of Color */}
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider mb-4 sm:mb-6 text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]">
              FOR MEN OF COLOR
            </h3>
            <p className="text-sm sm:text-base font-light leading-relaxed text-gray-300">
              Created with intention, designed with purpose. My formulations honor the unique needs of melanin-rich skin, addressing sensitivity with transparency and care.
            </p>
          </div>

          {/* Natural & Transparent */}
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider mb-4 sm:mb-6 text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]">
              NATURAL & TRANSPARENT
            </h3>
            <p className="text-sm sm:text-base font-light leading-relaxed text-gray-300">
              I believe you deserve to know what touches your skin. Every ingredient is chosen with integrity, every formula crafted with authenticity.
            </p>
          </div>

          {/* A Legacy of Confidence */}
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider mb-4 sm:mb-6 text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]">
              A LEGACY OF CONFIDENCE
            </h3>
            <p className="text-sm sm:text-base font-light leading-relaxed text-gray-300">
              This is more than grooming—it's a commitment to excellence, resilience, and community. Join a movement that celebrates who you are and honors where you come from.
            </p>
          </div>
        </div>

        {/* CTA to Story */}
        <div className="text-center">
          <Link
            href="/our-story"
            className="inline-block bg-white text-black px-10 py-4 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:shadow-[0_0_60px_rgba(251,191,36,0.6)]"
          >
            Read Dioly's Story
          </Link>
        </div>
      </div>
    </section>
  );
}
