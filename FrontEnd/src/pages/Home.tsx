import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HelpButton } from '../components/layout/HelpButton';

import { HeroSection } from '../components/sections/HeroSection';
import { StatsSection } from '../components/sections/StatsSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { AboutSection } from '../components/sections/AboutSection';
import { FeaturedProductsSection } from '../components/sections/FeaturedProductsSection';
import { CtaBanner } from '../components/sections/CtaBanner';

export interface HomeProps {
  onNavigateLogin?: () => void;
  onNavigateBooking?: () => void;
  onNavigateDashboard?: () => void; // Prop para direcionar para o ClientDashboard
}

export default function Home({ 
  onNavigateLogin, 
  onNavigateBooking, 
  onNavigateDashboard 
}: HomeProps) {
  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#2c2825] font-sans relative">
      {/* O Header recebe onNavigateDashboard para acionar ao clicar em "Meus Agendamentos" no menu do perfil */}
      <Header 
        onNavigateLogin={onNavigateLogin} 
        onNavigateBooking={onNavigateBooking} 
        onNavigateDashboard={onNavigateDashboard}
      />
      
      {/* Botão Agendar Horário do Hero conectado ao Agendamento */}
      <HeroSection onNavigateBooking={onNavigateBooking} />
      
      <StatsSection />
      <ServicesSection onNavigateBooking={onNavigateBooking} />
      <AboutSection />
      <FeaturedProductsSection />
      <CtaBanner />
      <Footer />
      <HelpButton />
    </div>
  );
}