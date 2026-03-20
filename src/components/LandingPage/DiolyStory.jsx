"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function DiolyStory() {
  const [titleRef, titleVisible] = useScrollAnimation();
  const [section1Ref, section1Visible] = useScrollAnimation(0.2);
  const [section2Ref, section2Visible] = useScrollAnimation(0.2);
  const [section2bRef, section2bVisible] = useScrollAnimation(0.2);
  const [section3Ref, section3Visible] = useScrollAnimation(0.2);
  const [section4Ref, section4Visible] = useScrollAnimation(0.2);
  const [section5Ref, section5Visible] = useScrollAnimation(0.2);
  const [section6Ref, section6Visible] = useScrollAnimation(0.2);
  const [section7Ref, section7Visible] = useScrollAnimation(0.2);

  return (
    <section className="relative bg-black text-white py-16 sm:py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] md:w-[1000px] md:h-[1000px] bg-amber-600/6 rounded-full blur-[100px] sm:blur-[120px] md:blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Title - Outside of Backdrop */}
        <div
          ref={titleRef}
          className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ease-out ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            DIOLY'S STORY
          </h2>
          <div className="h-px w-24 sm:w-32 bg-white mx-auto shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
        </div>

        {/* Backdrop Section with Two Sentences */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-20 sm:mb-28 md:mb-32">
          {/* Background Image - Zoomed In */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/images/landing/Bar_Of_Soap_Back_Drop_Story.jpg"
                alt="Bar of Soap Backdrop"
                fill
                className="object-cover scale-110 sm:scale-125 md:scale-150"
                priority
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
          </div>

          {/* Content - Two Sentences Close Together */}
          <div
            ref={section1Ref}
            className={`relative z-10 text-center py-20 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
              section1Visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-wide sm:tracking-wider text-gray-300 max-w-4xl mx-auto leading-relaxed mb-4">
              How one bar became the start of a new standard.
            </p>

            {/* Opening Quote - Larger Size */}
            <blockquote className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-wide italic text-white max-w-5xl mx-auto leading-tight drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
              "All I wanted was a bar of soap."
            </blockquote>
          </div>
        </div>

        {/* Section 2 - Before Bastion, There Was Tech */}
        <div
          ref={section2Ref}
          className={`mb-20 sm:mb-28 md:mb-32 transition-all duration-1000 ease-out ${
            section2Visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative aspect-square lg:aspect-[4/5] shadow-[0_0_30px_rgba(251,191,36,0.1)] sm:shadow-[0_0_60px_rgba(251,191,36,0.2)]">
              <Image
                src="/images/story/Doily_picture.png"
                alt="Dioly Alexandre - Founder"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide sm:tracking-wider mb-6 sm:mb-8 drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]">
                Before Bastion, There Was Tech
              </h3>
              <div className="h-px w-20 sm:w-24 bg-white mb-6 sm:mb-8 shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
              <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-gray-300">
                Before I started Bastion, I had already made my mark in the tech
                world. Speaking on stages at Fortune 500 company conferences,
                being an expert speaker at world cyber insurance conferences,
                briefing government leaders on the cyber threat landscape, and
                advising private equity–backed unicorns.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2b - In the Rooms */}
        <div
          ref={section2bRef}
          className={`mb-20 sm:mb-28 md:mb-32 transition-all duration-1000 ease-out ${
            section2bVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-gray-300">
                I was in rooms where every detail mattered—on camera, under
                lights, and in high-stakes conversations. That's when I
                realized: I needed to upgrade my skincare.
              </p>
            </div>

            {/* Image */}
            <div className="relative aspect-square order-1 lg:order-2 shadow-[0_0_30px_rgba(251,191,36,0.1)] sm:shadow-[0_0_60px_rgba(251,191,36,0.2)]">
              <Image
                src="/images/landing/Screenshot_20190218-232609.png"
                alt="High-stakes conversations"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section 3 - Naturally, I went looking */}
        <div
          ref={section3Ref}
          className={`mb-20 sm:mb-28 md:mb-32 text-center transition-all duration-1000 ease-out ${
            section3Visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8">
            Naturally, I went looking for the best. Top-shelf, luxury, elite.
            Easy, right?
          </p>
          <p className="text-4xl sm:text-5xl md:text-6xl font-light tracking-wider text-white drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]">
            Wrong.
          </p>
        </div>

        {/* Section 4 - There was nothing */}
        <div
          ref={section4Ref}
          className={`mb-20 sm:mb-28 md:mb-32 text-center transition-all duration-1000 ease-out ${
            section4Visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide italic text-gray-200 max-w-4xl mx-auto leading-relaxed drop-shadow-[0_0_25px_rgba(251,191,36,0.25)] px-4">
            "There was nothing. Not subpar. Not overpriced. Just nothing for
            us."
          </blockquote>
        </div>

        {/* Section 5 - This Was Personal with Backdrop */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-32">
          {/* Background Image - Stretched Full Width */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/images/landing/Bar_Soap_Back_Drop_Section.png"
                alt="Bar Soap Backdrop"
                fill
                className="object-cover"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
          </div>

          {/* Content in Box */}
          <div
            ref={section5Ref}
            className={`relative z-10 py-32 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
              section5Visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="max-w-4xl mx-auto bg-black/70 backdrop-blur-sm border border-white/20 p-8 md:p-12 lg:p-16 shadow-[0_0_80px_rgba(251,191,36,0.3)]">
              <h3 className="text-4xl md:text-5xl font-light tracking-wider mb-8 text-center drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]">
                This Was Personal
              </h3>
              <div className="h-px w-24 bg-white mb-8 mx-auto shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
              <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-gray-300">
                <p>
                  I've had sensitive skin since I was a kid. But it got worse
                  during my time as a Naval Cadet. When I had to shave daily,
                  the irritation was nonstop. Razor burn. Bumps. Redness.
                </p>
                <p>I tried everything. But none of it was made for our skin.</p>
                <p className="text-xl md:text-2xl text-white pt-4">
                  So I did what engineers do when a system fails:
                </p>
                <p className="text-2xl md:text-3xl font-light text-white text-center drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  I built a better one.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 - The 5 Steps */}
        <div
          ref={section6Ref}
          className={`mb-32 transition-all duration-1000 ease-out ${
            section6Visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center mb-16">
            <p className="text-2xl md:text-3xl font-light tracking-wider text-gray-300 max-w-4xl mx-auto leading-relaxed">
              I started like any serious tech company would:
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="border-l-2 border-amber-600/50 pl-8 py-4">
              <h4 className="text-2xl md:text-3xl font-light tracking-wider text-white mb-4">
                Step 1 - Acquire
              </h4>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                Acquire an R&D company with 20+ years of research on how
                skincare ingredients affect melanin-rich skin.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-2 border-amber-600/50 pl-8 py-4">
              <h4 className="text-2xl md:text-3xl font-light tracking-wider text-white mb-4">
                Step 2 - Study
              </h4>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                Use that data to build a proprietary AI model to formulate
                precision skincare products.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-2 border-amber-600/50 pl-8 py-4">
              <h4 className="text-2xl md:text-3xl font-light tracking-wider text-white mb-4">
                Step 3 - Design
              </h4>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                Design every product to solve real problems for men of
                color—from hyperpigmentation to post-shave irritation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="border-l-2 border-amber-600/50 pl-8 py-4">
              <h4 className="text-2xl md:text-3xl font-light tracking-wider text-white mb-4">
                Step 4 - Build
              </h4>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                Build national manufacturing infrastructure and procure the best
                ingredients from across the planet to craft the products in
                house.
              </p>
            </div>

            {/* Step 5 */}
            <div className="border-l-2 border-amber-600/50 pl-8 py-4">
              <h4 className="text-2xl md:text-3xl font-light tracking-wider text-white mb-4">
                Step 5 - Deploy
              </h4>
              <p className="text-lg font-light leading-relaxed text-gray-300">
                Deploy a fast, simple website where you can build your curated
                routine and have it shipped right to your door.
              </p>
            </div>
          </div>
        </div>

        {/* Section 7 - What started as one bar */}
        <div
          ref={section7Ref}
          className={`mb-32 transition-all duration-1000 ease-out ${
            section7Visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center">
            <div className="space-y-6 text-2xl md:text-3xl font-light leading-relaxed text-gray-300 max-w-4xl mx-auto mb-12">
              <p>What started as one bar of soap became a brand.</p>
              <p>That brand became a mission.</p>
              <p className="text-white text-3xl md:text-4xl pt-4">
                And that mission is now the first full ecosystem of skincare and
                grooming products built exclusively for men of color.
              </p>
            </div>
            <div className="h-px w-32 bg-white mx-auto my-12 shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
            <p className="text-xl md:text-2xl font-light italic text-gray-400 mb-20 sm:mb-24 md:mb-32">
              Built on science. Powered by data. Crafted with purpose.
            </p>
            <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] sm:tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              THE BASTION STANDARD
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
