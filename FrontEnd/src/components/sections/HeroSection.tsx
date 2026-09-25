import { MapPin } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center bg-[#1c1817]">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80" 
          alt="Ke Bella Salão" 
          className="w-full h-full object-cover object-center opacity-40 grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#181413]/90 via-[#181413]/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
        <div className="max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#2a2422]/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-[#e6d3cb]">
            <span className="w-2 h-2 rounded-full bg-[#a3644f] animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-[#a3644f]" />
            Espírito Santo do Pinhal, SP
          </div>

          <h1 className="text-5xl sm:text-7xl font-serif text-white leading-[1.1] font-normal tracking-tight">
            Beleza que <br />
            <span className="italic font-light text-[#f3e3dd]">transforma.</span> <br />
            Confiança que dura.
          </h1>

          <p className="text-base sm:text-lg text-[#d0c4be] max-w-lg leading-relaxed font-normal">
            No Ke Bella, cada detalhe é pensado para realçar sua beleza natural com técnicas modernas e cuidado exclusivo.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button className="bg-[#a3644f] hover:bg-[#8a4f3d] text-white font-medium py-3.5 px-8 rounded-xl shadow-md transition-all text-sm">
              Agendar horário
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 px-8 rounded-xl border border-white/20 backdrop-blur-sm transition-all text-sm">
              Conhecer serviços
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}