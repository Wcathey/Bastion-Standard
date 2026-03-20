"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const products = [
  {
    name: "Simple: Crisp",
    tagline: "Refreshing. Energizing. Bold.",
    description:
      "Infused with eucalyptus and spearmint, Simple: Crisp delivers a refreshing cleanse that wakes up your skin and senses. Designed for men of color, this bar hydrates while deeply purifying, making every wash a bold act of self-care.",
    keyBenefits: [
      "Deep cleanse that preserves skin's natural moisture",
      "Eucalyptus + spearmint refresh and energize",
      "Nourishing formula supports clear, healthy skin",
    ],
    scentProfile:
      "Bright, cooling, and revitalizing, a crisp blend of eucalyptus and spearmint",
    valueStatement:
      "For those who value: energy, clarity, and intentional self-renewal",
    image: "/images/landing/Simple_Crisp_Bar_Soap_Single.png",
    filterParam: "simple-crisp",
  },
  {
    name: "Simple: Pure",
    tagline: "Clean. Balanced. Essential.",
    description:
      "Crafted for men of color, Simple: Pure is a fragrance-free soap bar that gently cleanses without stripping your skin. Made without unnecessary additives, it delivers a rich lather and lasting hydration, perfect for sensitive or minimalist routines.",
    keyBenefits: [
      "Gentle, non-drying cleanse",
      "Fragrance- and dye-free",
      "Hypoallergenic and ideal for sensitive skin",
      "Designed specifically for men of color",
    ],
    scentProfile: "",
    valueStatement:
      "For those who value simplicity, performance, and skin-first standards.",
    image: "/images/landing/Simple_Pure_Bar_Soap_Single.png",
    filterParam: "simple-pure",
  },
  {
    name: "Simple: Purify",
    tagline: "Detoxifying. Renewing. Pure.",
    description:
      "Formulated for men of color, Simple: Purify uses Kaolin clay and tea tree oil to gently draw out impurities, calm irritation, and hydrate your skin. The result: a smooth, balanced complexion with minimal effort.",
    keyBenefits: [
      "Kaolin clay detoxifies without stripping moisture",
      "Tea tree oil soothes and refreshes",
      "Hydrating formula supports clear, even skin",
    ],
    scentProfile: "Clean, earthy, and grounded with subtle tea tree notes",
    valueStatement:
      "For those who value: clarity, balance, and elevated simplicity",
    image: "/images/landing/Simple_Purify_Soap_Bar_Single.png",
    filterParam: "simple-purify",
  },
];

function ProductItem({ product, index }) {
  const [ref, isVisible] = useScrollAnimation(0.15);
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`flex flex-col ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      } items-center gap-8 sm:gap-10 md:gap-12 lg:gap-20`}
    >
      {/* Product Image */}
      <div
        className={`flex-1 w-full relative transition-all duration-1000 ease-out ${
          isVisible
            ? "opacity-100 translate-x-0"
            : `opacity-0 ${isEven ? "-translate-x-20" : "translate-x-20"}`
        }`}
      >
        <div className="relative aspect-square shadow-[0_0_30px_rgba(251,191,36,0.1)] sm:shadow-[0_0_40px_rgba(251,191,36,0.15)] md:shadow-[0_0_60px_rgba(251,191,36,0.2)] hover:shadow-[0_0_80px_rgba(251,191,36,0.3)] transition-shadow duration-500">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Product Info */}
      <div
        className={`flex-1 w-full text-center lg:text-left transition-all duration-1000 ease-out delay-200 ${
          isVisible
            ? "opacity-100 translate-x-0"
            : `opacity-0 ${isEven ? "translate-x-20" : "-translate-x-20"}`
        }`}
      >
        <p className="text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] text-gray-400 mb-3 sm:mb-4 uppercase">
          {product.tagline}
        </p>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide sm:tracking-wider mb-5 sm:mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]">
          {product.name}
        </h3>
        <div className="h-px w-14 sm:w-16 bg-white mb-6 sm:mb-8 mx-auto lg:mx-0 shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>

        <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-gray-300 mb-5 sm:mb-6 max-w-lg mx-auto lg:mx-0">
          {product.description}
        </p>

        {/* Key Benefits */}
        {product.keyBenefits && product.keyBenefits.length > 0 && (
          <div className="mb-6 max-w-lg mx-auto lg:mx-0">
            <h4 className="text-sm tracking-[0.2em] text-white mb-3 uppercase font-semibold">
              Key Benefits:
            </h4>
            <ul className="space-y-2 text-sm md:text-base font-light text-gray-300">
              {product.keyBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Scent Profile */}
        {product.scentProfile && !product.scentProfile.startsWith("[") && (
          <div className="mb-6 max-w-lg mx-auto lg:mx-0">
            <h4 className="text-sm tracking-[0.2em] text-white mb-2 uppercase font-semibold">
              Scent Profile:
            </h4>
            <p className="text-sm md:text-base font-light italic text-gray-300">
              {product.scentProfile}
            </p>
          </div>
        )}

        {/* Value Statement */}
        {product.valueStatement && !product.valueStatement.startsWith("[") && (
          <p className="text-sm md:text-base font-light italic text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
            {product.valueStatement}
          </p>
        )}

        <Link
          href={`/products?filter=${product.filterParam}`}
          className="inline-block border border-white px-8 py-3 sm:px-10 sm:py-4 text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_25px_rgba(251,191,36,0.2)] hover:shadow-[0_0_40px_rgba(251,191,36,0.4)]"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  const [headerRef, headerVisible] = useScrollAnimation();
  const [collectionRef, collectionVisible] = useScrollAnimation(0.2);
  const [buttonRef, buttonVisible] = useScrollAnimation();

  return (
    <section className="relative bg-black text-white py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] md:w-[1200px] md:h-[1200px] bg-amber-600/6 rounded-full blur-[100px] sm:blur-[125px] md:blur-[150px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 sm:mb-14 md:mb-16 transition-all duration-1000 ease-out ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            THE COLLECTION
          </h2>
          <div className="h-px w-24 sm:w-32 bg-white mx-auto mb-6 sm:mb-8 shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
          <p className="text-xl md:text-2xl font-light tracking-wider text-gray-300 max-w-3xl mx-auto">
            Designed for the modern man who values authenticity, quality, and
            legacy
          </p>
        </div>

        {/* Simple Bar Soap Collection Header */}
        <div
          ref={collectionRef}
          className={`mb-16 sm:mb-20 md:mb-24 transition-all duration-1000 ease-out ${
            collectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Collection Image */}
            <div className="flex-1 relative">
              <div className="relative aspect-square shadow-[0_0_80px_rgba(251,191,36,0.25)] hover:shadow-[0_0_100px_rgba(251,191,36,0.35)] transition-shadow duration-500">
                <Image
                  src="/images/landing/Simple_Bar_Soap_Set_Main.png"
                  alt="Simple Bar Soap Collection"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Collection Info */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-5xl md:text-6xl font-light tracking-wider mb-6 drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]">
                Simple Bar Soap Collection
              </h3>
              <div className="h-px w-24 bg-white mb-8 mx-auto lg:mx-0 shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
              <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-8">
                Three distinct varieties crafted for the modern man. Each bar
                delivers a unique experience while maintaining our commitment to
                natural ingredients and authentic care.
              </p>
              <p className="text-base md:text-lg font-light italic text-gray-400 max-w-2xl mx-auto lg:mx-0">
                Simple. Pure. Crisp.
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-20 sm:space-y-24">
          {products.map((product, index) => (
            <ProductItem key={product.name} product={product} index={index} />
          ))}
        </div>

        {/* Explore All Button */}
        <div
          ref={buttonRef}
          className={`text-center mt-16 sm:mt-20 transition-all duration-1000 ease-out ${
            buttonVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Link
            href="/products"
            className="inline-block bg-white text-black px-16 py-5 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:shadow-[0_0_60px_rgba(251,191,36,0.6)]"
          >
            Explore All
          </Link>
        </div>
      </div>
    </section>
  );
}
