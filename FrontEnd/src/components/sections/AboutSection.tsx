import { CheckCircle2 } from 'lucide-react';

export function AboutSection() {
{/* array que armazena a lista */}
  const features = [
    'Profissionais certificadas e em formação contínua',
    'Produtos de marcas premium e veganas',
    'Ambiente limpo, aconchegante e organizado',
    'Agendamento online 24 horas',
  ];

  return (
    <section className="py-20 bg-[#f2ece8] px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        

        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80" alt="Nossa História" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 right-6 bg-white p-6 rounded-2xl shadow-md border border-[#eee6e2] text-center min-w-[140px]">
            <span className="text-3xl font-serif font-normal text-[#a3644f] block">2016</span>
            <span className="text-xs text-[#7a6f6a] font-medium">Fundado em</span>
          </div>
        </div>

     
        <div className="space-y-6 lg:pl-6">
          <span className="text-xs uppercase tracking-widest text-[#a3644f] font-semibold">Nossa História</span>
          <h2 className="text-4xl sm:text-5xl font-serif text-[#2c2825] leading-tight">
            Beleza com propósito, <br />cuidado com alma
          </h2>
          <p className="text-sm sm:text-base text-[#6e635f] leading-relaxed">
            O Ke Bella nasceu do sonho de criar um espaço onde cada cliente se sinta especial. Desde 2016, atendemos mulheres de Espírito Santo do Pinhal com técnicas modernas, produtos de qualidade e um ambiente acolhedor.
          </p>
          <p className="text-sm sm:text-base text-[#6e635f] leading-relaxed">
            Nossa equipe de profissionais especializadas está sempre em formação contínua para oferecer o que há de mais atual em beleza e bem-estar.
          </p>

  
    {/* 
  Mapeia o array 'features' para exibir a lista de diferenciais do salão.
  Cada item é renderizado em um <li> alinhado com o ícone de check (CheckCircle2).
   */}
          <ul className="space-y-3 pt-2 text-sm text-[#4a423e]">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#a3644f]" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <button className="bg-[#a3644f] hover:bg-[#8a4f3d] text-white font-medium py-3.5 px-8 rounded-xl shadow-sm transition-all text-sm">
              Agende sua visita
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
