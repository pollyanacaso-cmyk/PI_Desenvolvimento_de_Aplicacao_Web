import { CheckCircle2 } from 'lucide-react';

interface AboutSectionProps {
  onNavigateBooking?: () => void;
}

export function AboutSection({ onNavigateBooking }: AboutSectionProps) {
  const highlights = [
    'Profissionais certificadas e em formação contínua',
    'Produtos de marcas premium e veganas',
    'Ambiente limpo, aconchegante e organizado',
    'Agendamento online 24 horas',
  ];

  return (
    <section id="sobre" className="py-20 px-6 lg:px-12 bg-[#f8f5f2]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Lado Esquerdo: Imagem com Card Flutuante de Ano */}
        <div className="relative">
          <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1000"
              alt="Atendimento no Ke Bella"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Badge Flutuante 2016 */}
          <div className="absolute bottom-6 right-6 bg-white p-5 rounded-2xl shadow-xl border border-[#f0ece9] text-center min-w-[130px]">
            <span className="font-serif text-3xl font-bold text-[#a3644f] block">2016</span>
            <span className="text-xs text-[#6e635f] font-medium uppercase tracking-wider">Fundado em</span>
          </div>
        </div>

        {/* Lado Direito: Conteúdo Institucional */}
        <div className="space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3a2e2b] leading-tight">
            Beleza com propósito, <br />
            cuidado com alma
          </h2>

          <div className="space-y-4 text-sm text-[#6e635f] leading-relaxed font-light">
            <p>
              O Ke Bella nasceu do sonho de criar um espaço onde cada cliente se sinta especial. 
              Desde 2016, atendemos mulheres de Espírito Santo do Pinhal com técnicas modernas, 
              produtos de qualidade e um ambiente acolhedor.
            </p>
            <p>
              Nossa equipe de profissionais especializadas está sempre em formação contínua para 
              oferecer o que há de mais atual em beleza e bem-estar.
            </p>
          </div>

          {/* Lista de Diferenciais com Checkmark */}
          <div className="space-y-3 pt-2">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#a3644f] flex-shrink-0" />
                <span className="text-xs sm:text-sm text-[#3a2e2b] font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Botão Agende sua visita */}
          <div className="pt-4">
            <button
              onClick={onNavigateBooking}
              className="px-7 py-3.5 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              Agende sua visita
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}