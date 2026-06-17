import type { Metadata } from "next";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import WhyWhatsApp from "./components/WhyWhatsApp";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <WhyWhatsApp />
      <HowItWorks />
      <About />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <Footer />
    </main>
  );
}
