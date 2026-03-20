"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function Hero() {
  const [titleRef, titleVisible] = useScrollAnimation();
  const [goodsRef, goodsVisible] = useScrollAnimation(0.3);
  const [descRef, descVisible] = useScrollAnimation(0.3);

  return (
    <section className="relative bg-black text-white min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm glow background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] bg-amber-600/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]"></div>
      </div>

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing/black-man-with-shaving-cream-skincare-product-face-studio-background-smooth-facial-hair-young-african-model-grooming-male-hygiene-cleaning-beard-with-cosmetic-morning-routine_590464-1.png"
          alt="Bastion Standard"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 text-center">
        <div
          ref={titleRef}
          className={`transition-all duration-1000 ease-out ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light tracking-wider drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            BASTION STANDARD
          </h1>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light tracking-wider mb-6 sm:mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            COMPANY
          </h2>
          <div className="h-px w-24 sm:w-32 bg-white mx-auto mb-6 sm:mb-8 shadow-[0_0_20px_rgba(251,191,36,0.6)]"></div>
        </div>

        {/* Look Good, Feel Good, Be Good - Horizontal Flex */}
        <div
          ref={goodsRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 lg:gap-16 mb-12 sm:mb-16"
        >
          {/* Look Good Container */}
          <div
            className={`transition-all duration-1000 ease-out ${
              goodsVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.2em] sm:tracking-[0.3em] drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              LOOK GOOD
            </p>
          </div>

          {/* Feel Good Container */}
          <div
            className={`transition-all duration-1000 ease-out delay-300 ${
              goodsVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.2em] sm:tracking-[0.3em] drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              FEEL GOOD
            </p>
          </div>

          {/* Be Good Container */}
          <div
            className={`transition-all duration-1000 ease-out delay-[600ms] ${
              goodsVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.2em] sm:tracking-[0.3em] drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              BE GOOD
            </p>
          </div>
        </div>

        <div
          ref={descRef}
          className={`transition-all duration-1000 ease-out ${
            descVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="h-px w-24 sm:w-32 bg-white mx-auto mb-8 sm:mb-12 shadow-[0_0_20px_rgba(251,191,36,0.6)]"></div>

          <p className="text-base sm:text-lg md:text-xl font-light tracking-wider max-w-3xl mx-auto leading-relaxed px-4">
            A legacy of wellness for the modern man. Where self-care reflects
            freedom, balance, and excellence.
          </p>

          <div className="mt-12 sm:mt-16">
            <Link
              href="/products"
              className="inline-block bg-white text-black px-8 py-3 sm:px-12 sm:py-4 text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:shadow-[0_0_60px_rgba(251,191,36,0.6)]"
            >
              Discover The Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
