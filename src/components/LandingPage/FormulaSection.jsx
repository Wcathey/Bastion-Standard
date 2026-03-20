"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const visionSections = [
  {
    title: "NATURAL INGREDIENTS",
    subtitle: "Pure, Transparent, Effective",
    description:
      "At Bastion Standard, we believe in the power of nature. Our products are crafted with all-natural ingredients, carefully selected for their proven benefits and purity. We create a naturalized line of skincare that honors your skin and respects the earth. Every formula is transparent, effective, and rooted in the integrity of nature—because what you put on your skin matters.",
    image: "/images/landing/cosmetic-containers_1.jpg",
    buttonText: "View Ingredients",
    buttonHref: "/ingredients",
  },
  {
    title: "NATURAL EXPERIENCE",
    subtitle: "Events That Reflect Our Values",
    description:
      "We create immersive experiences that align with our philosophy of wellness, community, and authenticity. Through curated events, workshops, and gatherings, we foster connections that match our values—spaces where men can engage, learn, and grow. These experiences extend beyond products, building a culture of confidence, self-care, and collective empowerment.",
    image: "/images/landing/20190917_031610188_iOS_4.jpg",
    buttonText: "View Upcoming Events",
    buttonHref: "/events",
  },
  {
    title: "NATURAL REALITY",
    subtitle: "An Ecosystem Built for You",
    description:
      "We are creating an ecosystem that is tangibly realistic and deeply relevant to our audience. This is not aspiration without action—it's a commitment to building a sustainable, accessible, and authentic community. From our products to our partnerships, everything we do is grounded in the real needs and experiences of men who value quality, transparency, and purpose.",
    image: "/images/landing/1000-facecare-1685998380388_3.webp",
    buttonText: "The Bastion Journal",
    buttonHref: "/journal",
  },
];

function VisionSection({ section, index }) {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <div
      className={`relative min-h-screen flex items-center py-24 ${
        index % 2 === 0 ? "bg-black" : "bg-zinc-950"
      }`}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute ${index % 2 === 0 ? "right-1/4" : "left-1/4"} top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/8 rounded-full blur-[100px]`}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left Column - Text Content */}
          <div
            className={`transition-all duration-1000 ease-out ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <div className="mb-8">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] text-white mb-4 drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]">
                {section.title}
              </h2>
              <div className="h-px w-24 bg-white shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
            </div>

            <h3
              className={`text-xl md:text-2xl font-light tracking-wider text-white mb-6 transition-all duration-1000 ease-out delay-200 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
            >
              {section.subtitle}
            </h3>

            <p
              className={`text-base md:text-lg font-light leading-relaxed text-gray-300 tracking-wide mb-8 transition-all duration-1000 ease-out delay-400 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
            >
              {section.description}
            </p>

            <div
              className={`transition-all duration-1000 ease-out delay-600 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
            >
              <Link
                href={section.buttonHref}
                className="inline-block bg-white text-black px-8 py-3 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.5)]"
              >
                {section.buttonText}
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div
            className={`transition-all duration-1000 ease-out delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-20"
            }`}
          >
            <div className="relative aspect-square w-full shadow-[0_0_80px_rgba(251,191,36,0.25)] hover:shadow-[0_0_100px_rgba(251,191,36,0.35)] transition-shadow duration-500">
              <Image
                src={section.image}
                alt={section.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormulaSection() {
  return (
    <section className="relative bg-black flex flex-col justify-evenly">
      {/* Central warm glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Vision Sections */}
      <div>
        {visionSections.map((section, index) => (
          <VisionSection key={section.title} section={section} index={index} />
        ))}
      </div>
    </section>
  );
}
