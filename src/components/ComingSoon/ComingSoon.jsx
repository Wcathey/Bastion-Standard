"use client";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-light tracking-[0.3em] text-white mb-8">
          COMING SOON
        </h1>
        <div className="h-px w-32 bg-white mx-auto mb-8"></div>
        <p className="text-lg md:text-xl font-light text-gray-400 tracking-wide">
          This page is under construction. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}
