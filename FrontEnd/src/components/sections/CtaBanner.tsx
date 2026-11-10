import React from 'react';
import { Sparkles } from 'lucide-react';

interface CtaBannerProps {
  onNavigateBooking?: () => void;
}

export function CtaBanner({ onNavigateBooking }: CtaBannerProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onNavigateBooking) {
      onNavigateBooking();
    } else {
      // Fallback de segurança caso a prop não seja repassada no pai
      window.dispatchEvent(new CustomEvent('navigate-booking'));
    }
  };

  return (
    <section className="py-16 px-6 lg:px-12 bg-[#f8f5f2]">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-[#a3644f] text-white p-10 sm:p-16 text-center overflow-hidden shadow-xl">
          
          {/* Elementos decorativos */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none z-0" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-white/90">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sua experiência completa de beleza</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-white">
              Pronta para se sentir ainda mais linda?
            </h2>

            <p className="text-xs sm:text-sm text-white/85 max-w-lg mx-auto font-light leading-relaxed">
              Agende seu horário online em poucos cliques e garanta o atendimento exclusivo da nossa equipe especializada.
            </p>

            <div className="pt-2 relative z-30">
              <button
                type="button"
                onClick={handleClick}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#fcfbfa] active:bg-[#f0ece9] text-[#a3644f] text-xs sm:text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer relative z-30 inline-block"
              >
                Agendar agora — é rápido e fácil
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}