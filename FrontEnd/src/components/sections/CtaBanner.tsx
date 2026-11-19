import React from 'react';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

interface CtaBannerProps {
  onNavigateBooking?: () => void;
  onNavigateServices?: () => void;
}

export function CtaBanner({ onNavigateBooking, onNavigateServices }: CtaBannerProps) {
  const handleAgendar = () => {
    if (onNavigateServices) onNavigateServices();
    else if (onNavigateBooking) onNavigateBooking();
  };

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#a3644f] text-white overflow-hidden shadow-2xl border-y border-white/10">
      
      {/* Luzes de Glow Elegantes de Fundo */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#2A211F]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Conteúdo Centralizado */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          Sua experiência completa de beleza
        </div>

        {/* Título Principal */}
        <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
          Pronta para se sentir ainda <br className="hidden sm:inline" />
          <span className="italic font-normal">mais linda?</span>
        </h2>

        {/* Subtítulo */}
        <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
          Agende seu horário online em poucos cliques e garanta o atendimento exclusivo da nossa equipe especializada.
        </p>

        {/* Botão de Agendamento */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleAgendar}
            className="group py-4 px-8 bg-white hover:bg-[#f8f5f2] text-[#a3644f] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Calendar className="w-4 h-4 text-[#a3644f]" />
            <span>Agendar agora — é rápido e fácil</span>
            <ArrowRight className="w-4 h-4 text-[#a3644f] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}

export default CtaBanner;