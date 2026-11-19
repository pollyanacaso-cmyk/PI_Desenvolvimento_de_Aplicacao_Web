import React from 'react';
import { Scissors, Sparkles, Eye, Feather, ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  onNavigateServices?: (categoriaId?: string) => void;
}

export function ServicesSection({ onNavigateServices }: ServicesSectionProps) {
  const CATEGORIAS_HOME = [
    {
      id: 'cabelos',
      nome: 'Cabelos',
      badge: 'MAIS PROCURADO',
      qtd: '28 Serviços',
      desc: 'Cortes modernos, Colorações, Progressivas & Tratamentos Capilares.',
      imagem: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600',
      icone: Scissors
    },
    {
      id: 'manicure',
      nome: 'Manicure & Pedicure',
      badge: 'ATENDIMENTO DUPLO',
      qtd: '8 Serviços',
      desc: 'Cuidados completos para mãos, pés e esmaltações exclusivas.',
      imagem: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600',
      icone: Sparkles
    },
    {
      id: 'sobrancelha',
      nome: 'Sobrancelhas',
      badge: 'HARMONIZAÇÃO',
      qtd: '4 Serviços',
      desc: 'Design personalizado, Henna e Micropigmentação.',
      imagem: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
      icone: Eye
    },
    {
      id: 'depilacao',
      nome: 'Depilação',
      badge: 'PELE SUAVE',
      qtd: '3 Serviços',
      desc: 'Depilação facial e corporal suave, garantindo pele macia.',
      imagem: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&q=80&w=600',
      icone: Feather
    }
  ];

  return (
    <section className="py-20 bg-[#3a2e2b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIAS_HOME.map((cat) => {
            const Icone = cat.icone;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigateServices && onNavigateServices(cat.id)}
                className="group bg-[#4a3d39] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between cursor-pointer hover:border-[#a3644f] transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={cat.imagem}
                    alt={cat.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4a3d39] via-transparent to-transparent" />
                  <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[10px] font-bold tracking-wider px-3 py-1 rounded-full text-white uppercase border border-white/10">
                    {cat.badge}
                  </span>
                  <div className="absolute bottom-4 left-4 p-2.5 bg-[#a3644f] text-white rounded-2xl shadow-md">
                    <Icone className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
                      <span>{cat.qtd}</span>
                      <span>•</span>
                      <span>Agende Rápido</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light text-white group-hover:text-[#a3644f] transition-colors">
                      {cat.nome}
                    </h3>
                    <p className="text-xs text-white/70 mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#a3644f]">
                    <span>Explorar Opções</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;