import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HelpButton } from '../components/layout/HelpButton';

import { HeroSection } from '../components/sections/HeroSection';
import { StatsSection } from '../components/sections/StatsSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { AboutSection } from '../components/sections/AboutSection';
import { FeaturedProductsSection } from '../components/sections/FeaturedProductsSection';
import { CtaBanner } from '../components/sections/CtaBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#2c2825] font-sans relative">
      <Header />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <AboutSection />
      <FeaturedProductsSection />
      <CtaBanner />
      <Footer />
      <HelpButton />
    </div>
  );
}