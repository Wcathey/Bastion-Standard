import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Layout/Footer";
import Header from "@/components/Layout/Header";

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Bastion Standard - Premium Men's Grooming & Skincare",
  description:
    "Discover Bastion Standard's premium men's grooming and skincare products. Elevate your daily routine with our scientifically-formulated solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
