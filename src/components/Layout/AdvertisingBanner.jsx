"use client";

import { useEffect, useState } from "react";

const messages = [
  "Hassle-Free Returns",
  "Subscribe and Save 10%",
  "We Have the Best, For the Best of Us",
];

export default function AdvertisingBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-white overflow-hidden text-center">
      <p
        className={`font-semibold tracking-[0.25em] text-sm md:text-base lg:text-lg uppercase transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {messages[currentIndex]}
      </p>
    </div>
  );
}
