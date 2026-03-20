"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const visionSections = [
  {
    title: "SEE IT",
    subtitle: "Your Reflection of Excellence",
    description:
      "Rooted in integrity, inclusivity, and impact. A world where every man feels seen, confident, and connected to a legacy of wellness. Bastion Standard envisions a future where self-care reflects freedom, balance, and excellence—bridging community and heritage to create a timeless culture of confidence and care.",
    image:
      "/images/landing/Render_Mockup_4000_3000_2025-05-18_3_-Pacdora_1.png",
  },
  {
    title: "MOVE IT",
    subtitle: "Action Rooted in Authenticity",
    description:
      "To restore confidence and authenticity in men's skin care with natural, transparent formulations. We empower men by promoting self-esteem and intergenerational wellness, redefining self-care with awareness. Our products honor resilience and community, transforming skincare into an act of self-validation.",
    image:
      "/images/landing/Render_Mockup_4000_3000_2025-05-19-Pacdora_300e6f01-8a14-4954-a31b-a11285e63b52.png",
  },
  {
    title: "BE IT",
    subtitle: "Embody Your Worth",
    description:
      "When you look good, you feel good, you are good. Skincare is wellness. This is more than a routine—it's a commitment to yourself, your legacy, and the community that stands with you. Be the standard of excellence.",
    image: "/images/landing/Render_Mockup_4000_3000_2025-05-18-Pacdora_3.png",
  },
];

function VisionSection({ section, index }) {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <div
      className={`relative min-h-screen flex items-center ${
        index % 2 === 0 ? "bg-black" : "bg-zinc-950"
      }`}
    >
      {/* Background Image with Heavy Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={section.image}
          alt={section.title}
          fill
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div
          ref={ref}
          className={`max-w-3xl transition-all duration-1000 ease-out ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-20"
          }`}
        >
          <div className="mb-8">
            <h2 className="text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.2em] text-white mb-4">
              {section.title}
            </h2>
            <div className="h-px w-24 bg-white"></div>
          </div>

          <h3
            className={`text-2xl md:text-3xl font-light tracking-wider text-white mb-8 transition-all duration-1000 ease-out delay-200 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            {section.subtitle}
          </h3>

          <p
            className={`text-lg md:text-xl font-light leading-relaxed text-gray-300 tracking-wide transition-all duration-1000 ease-out delay-400 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            {section.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VisionSections() {
  return (
    <section className="bg-black">
      {visionSections.map((section, index) => (
        <VisionSection key={section.title} section={section} index={index} />
      ))}
    </section>
  );
}
