import React from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import ServicesSection from '../components/sections/ServicesSection';
import AboutSection from '../components/sections/AboutSection';
import ProfessionalsSection from '../components/sections/ProfessionalsSection';
import CtaBanner from '../components/sections/CtaBanner';
import Footer from '../components/layout/Footer';

export interface HomeProps {
  onNavigateServices?: (categoriaId?: string) => void;
  onNavigateBooking?: (params?: any) => void;
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
  usuarioNome?: string;
  usuarioTipo?: 'cliente' | 'admin' | 'profissional';
  carrinhoCount?: number;
}

export function Home({
  onNavigateServices,
  onNavigateBooking,
  onNavigateLogin,
  onNavigateDashboard,
  onLogout,
  usuarioNome,
  usuarioTipo,
  carrinhoCount
}: HomeProps) {
  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#3a2e2b]">
      <Header
        currentPage="home"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateProfessionals={() => document.getElementById('profissionais')?.scrollIntoView({ behavior: 'smooth' })}
        onNavigateServices={onNavigateServices}
        onNavigateBooking={onNavigateBooking}
        onNavigateLogin={onNavigateLogin}
        onNavigateDashboard={onNavigateDashboard}
        onLogout={onLogout}
        usuarioNome={usuarioNome}
        usuarioTipo={usuarioTipo}
        carrinhoCount={carrinhoCount}
      />
      <main>
        <HeroSection
          onNavigateServices={onNavigateServices}
          onNavigateBooking={onNavigateBooking}
        />
        <StatsSection />
        <ServicesSection onNavigateServices={onNavigateServices} />
        <AboutSection
          onNavigateServices={onNavigateServices}
          onNavigateBooking={onNavigateBooking}
        />
        <ProfessionalsSection />
        <CtaBanner
          onNavigateServices={onNavigateServices}
          onNavigateBooking={onNavigateBooking}
        />
      </main>
      <Footer />
    </div>
  );
}

export default Home;