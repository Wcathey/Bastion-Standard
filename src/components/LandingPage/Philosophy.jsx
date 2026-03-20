"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function Philosophy() {
  const [headerRef, headerVisible] = useScrollAnimation();
  const [imageRef, imageVisible] = useScrollAnimation(0.2);
  const [contentRef, contentVisible] = useScrollAnimation(0.2);
  const [buttonRef, buttonVisible] = useScrollAnimation();
  const [quoteRef, quoteVisible] = useScrollAnimation();

  return (
    <section className="relative bg-black text-white py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-[900px] h-[900px] bg-amber-600/7 rounded-full blur-[140px]"></div>
      </div>

      {/* Background Pattern/Texture */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-white"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-1000 ease-out ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-6xl md:text-7xl font-light tracking-[0.2em] mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            OUR PHILOSOPHY
          </h2>
          <div className="h-px w-32 bg-white mx-auto mb-12 shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
          <p className="text-2xl md:text-3xl font-light tracking-wider text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Skincare is wellness. Self-care is self-validation.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          {/* Left - Image */}
          <div
            ref={imageRef}
            className={`relative aspect-square lg:aspect-[4/5] transition-all duration-1000 ease-out shadow-[0_0_70px_rgba(251,191,36,0.2)] hover:shadow-[0_0_90px_rgba(251,191,36,0.3)] transition-shadow duration-500 ${
              imageVisible
                ? "opacity-100 -translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <Image
              src="/images/landing/Render_Mockup_4000_3000_2025-05-18_1_-Pacdora_2.png"
              alt="Bastion Standard Philosophy"
              fill
              className="object-contain"
            />
          </div>

          {/* Right - Content */}
          <div
            ref={contentRef}
            className="flex flex-col justify-center space-y-12"
          >
            <div
              className={`transition-all duration-700 ease-out ${
                contentVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
            >
              <h3 className="text-3xl md:text-4xl font-light tracking-wider mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                For Men of Color
              </h3>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                Created with intention, designed with purpose. Our formulations
                honor the unique needs of melanin-rich skin, addressing
                sensitivity with transparency and care.
              </p>
            </div>

            <div
              className={`transition-all duration-700 ease-out delay-200 ${
                contentVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
            >
              <h3 className="text-3xl md:text-4xl font-light tracking-wider mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                Natural & Transparent
              </h3>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                We believe you deserve to know what touches your skin. Every
                ingredient is chosen with integrity, every formula crafted with
                authenticity.
              </p>
            </div>

            <div
              className={`transition-all duration-700 ease-out delay-400 ${
                contentVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
            >
              <h3 className="text-3xl md:text-4xl font-light tracking-wider mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                A Legacy of Confidence
              </h3>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                This is more than grooming—it's a commitment to excellence,
                resilience, and community. Join a movement that celebrates who
                you are and honors where you come from.
              </p>
            </div>
          </div>
        </div>

        {/* Learn More Button */}
        <div
          ref={buttonRef}
          className={`text-center mt-16 mb-16 transition-all duration-1000 ease-out ${
            buttonVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Link
            href="/about"
            className="inline-block border border-white px-12 py-5 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.25)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)]"
          >
            Learn More
          </Link>
        </div>

        {/* Bottom Quote */}
        <div
          ref={quoteRef}
          className={`text-center border-t border-white/20 pt-16 transition-all duration-1000 ease-out ${
            quoteVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <blockquote className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide italic text-gray-200 max-w-5xl mx-auto leading-relaxed drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]">
            "When you invest in yourself, you invest in your legacy."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
