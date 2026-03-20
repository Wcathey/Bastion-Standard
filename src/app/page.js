import BrandPhilosophy from "@/components/LandingPage/BrandPhilosophy";
import CallToAction from "@/components/LandingPage/CallToAction";
import Hero from "@/components/LandingPage/Hero";
import ProductShowcase from "@/components/LandingPage/ProductShowcase";

export default function Home() {
  return (
    <main className="bg-black">
      <Hero />
      <BrandPhilosophy />
      <ProductShowcase />
      <CallToAction />
    </main>
  );
}
