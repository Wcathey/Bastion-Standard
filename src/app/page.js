import CallToAction from "@/components/LandingPage/CallToAction";
import DiolyStory from "@/components/LandingPage/DiolyStory";
import FormulaSection from "@/components/LandingPage/FormulaSection";
import Hero from "@/components/LandingPage/Hero";
import ProductShowcase from "@/components/LandingPage/ProductShowcase";

export default function Home() {
  return (
    <main className="bg-black">
      <Hero />
      <DiolyStory />
      <FormulaSection />
      <ProductShowcase />
      <CallToAction />
    </main>
  );
}
