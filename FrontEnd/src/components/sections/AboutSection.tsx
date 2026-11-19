import React from 'react';
import { Sparkles, Calendar, ArrowRight, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

interface AboutSectionProps {
  onNavigateBooking?: () => void;
  onNavigateServices?: () => void;
}

export function AboutSection({ onNavigateBooking, onNavigateServices }: AboutSectionProps) {
  const DESTAQUES = [
    {
      titulo: 'Profissionais certificadas e em formação contínua',
      icone: Award
    },
    {
      titulo: 'Atendimento personalizado com atenção aos detalhes',
      icone: ShieldCheck
    },
    {
      titulo: 'Ambiente limpo, aconchegante e organizado',
      icone: HeartHandshake
    },
    {
      titulo: 'Agendamento online 24 horas rápido e descomplicado',
      icone: Calendar
    }
  ];

  const handleAgendar = () => {
    if (onNavigateServices) onNavigateServices();
    else if (onNavigateBooking) onNavigateBooking();
  };

  return (
    <section id="sobre" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#f8f5f2] border-t border-[#e5ded8]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* FOTO COM BADGE FLUTUANTE DE FUNDAÇÃO */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1000"
                alt="Atendimento Ke Bella"
                className="w-full h-[420px] sm:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Badge Flutuante "Fundado em 2016" */}
            <div className="absolute -bottom-6 right-6 sm:right-10 bg-white p-5 sm:p-6 rounded-3xl shadow-xl border border-[#f0ece9] flex items-center gap-4">
              <div className="p-3 bg-[#a3644f]/10 text-[#a3644f] rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#3a2e2b] block leading-none">
                  2016
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a09692] mt-1 block">
                  Fundado Em
                </span>
              </div>
            </div>
          </div>

          {/* CONTEÚDO DE TEXTO */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#a3644f]/10 border border-[#a3644f]/20 text-[#a3644f] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Nossa História & Essência
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#3a2e2b] leading-tight">
              Beleza com propósito, <br className="hidden sm:inline" />
              <span className="italic text-[#a3644f]">cuidado com alma</span>.
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#6e635f] leading-relaxed">
              <p>
                O Ke Bella nasceu do sonho de criar um espaço onde cada cliente se sinta especial e acolhida. Desde 2016, atendemos com técnicas modernas e um ambiente pensado para o seu bem-estar.
              </p>
              <p>
                Nossa equipe de profissionais especializadas está em constante aperfeiçoamento para entregar resultados que realçam a sua beleza natural.
              </p>
            </div>

            {/* LISTA DE DIFERENCIAIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {DESTAQUES.map((item, index) => {
                const Icone = item.icone;
                return (
                  <div key={index} className="flex items-start gap-3 p-2.5 rounded-2xl bg-white border border-[#f0ece9] shadow-xs">
                    <div className="p-1.5 bg-[#a3644f]/10 text-[#a3644f] rounded-xl flex-shrink-0 mt-0.5">
                      <Icone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-[#3a2e2b] leading-snug">
                      {item.titulo}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* BOTÃO DE AÇÃO */}
            <div className="pt-4">
              <button
                onClick={handleAgendar}
                className="group py-3.5 px-8 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-3 cursor-pointer"
              >
                <span>Agende sua visita</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default AboutSection;