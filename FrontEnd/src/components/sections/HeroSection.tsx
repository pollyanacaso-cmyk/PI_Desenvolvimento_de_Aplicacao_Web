import { MapPin } from 'lucide-react';

interface HeroSectionProps {
  onNavigateBooking?: () => void;
}

export function HeroSection({ onNavigateBooking }: HeroSectionProps) {
  const scrollToServices = () => {
    const element = document.getElementById('servicos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center bg-[#2c2825] text-white px-6 lg:px-12 py-16 overflow-hidden">
      {/* Imagem de Fundo com overlay suave */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000"
          alt="Salão Ke Bella"
          className="w-full h-full object-cover"
        />
        {/* Sombra gradiente focada na esquerda para dar legibilidade ao texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl text-left space-y-6">
          
          {/* Badge da Localização */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-white/80" />
              <span>Espírito Santo do Pinhal, SP</span>
            </div>
          </div>

          {/* Título Principal Alinhado à Esquerda */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.15] text-white">
            Beleza que <br />
            <span className="italic font-serif">transforma.</span> <br />
            Confiança que dura.
          </h1>

          {/* Subtítulo */}
          <p className="text-xs sm:text-sm text-white/85 max-w-xl font-light leading-relaxed">
            No Ke Bella, cada detalhe é pensado para realçar sua beleza natural com técnicas modernas e cuidado exclusivo.
          </p>

          {/* Botões de Ação na Esquerda */}
          <div className="flex flex-col sm:flex-row items-center justify-start gap-3 pt-2">
            
            {/* Botão Agendar horário -> Abre o fluxo de agendamento */}
            <button
              onClick={onNavigateBooking}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Agendar horário
            </button>

            {/* Botão Conhecer serviços -> Scroll suave até a secção Nossos Serviços */}
            <button
              onClick={scrollToServices}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-2xl border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
            >
              Conhecer serviços
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}