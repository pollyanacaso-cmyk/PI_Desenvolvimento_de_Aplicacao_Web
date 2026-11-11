import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ServicesSectionProps {
  onNavigateBooking?: (params?: { groupName?: string }) => void;
}

interface ServiceGroupCard {
  id: string;
  title: string;
  groupName: string; // Deve bater exatamente com o 'grupo' do banco SQL
  subtitle: string;
  image: string;
}

const SERVICE_GROUPS: ServiceGroupCard[] = [
  {
    id: 'corte',
    title: 'Cortes & Penteados',
    groupName: 'Corte',
    subtitle: 'Feminino, masculino e penteados especiais',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'botox',
    title: 'Botox Capilar',
    groupName: 'Botox',
    subtitle: 'Alinhamento e hidratação (curto, médio e longo)',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'progressiva',
    title: 'Progressiva & Selante',
    groupName: 'Progressiva',
    subtitle: 'Liso perfeito com opção por comprimento e retoque',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'coloracao',
    title: 'Coloração & Mechas',
    groupName: 'Coloracao',
    subtitle: 'Retoque de raiz, cabelo todo e aplicação',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'hidratacao',
    title: 'Hidratação & Nutrição',
    groupName: 'Hidratacao',
    subtitle: 'Tratamentos profundos e pacotes de sessões',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'unhas',
    title: 'Manicure & Pedicure',
    groupName: 'Unhas',
    subtitle: 'Manicure, pedicure, esmaltação e cuidados masculinos',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800'
  }
];

export function ServicesSection({ onNavigateBooking }: ServicesSectionProps) {
  return (
    <section id="servicos" className="py-20 bg-[#f8f5f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a3644f] mb-3 block">
            O que oferecemos
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#2c2825] tracking-tight">
            Nossos Serviços
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICE_GROUPS.map((group) => (
            <div
              key={group.id}
              onClick={() => {
                if (onNavigateBooking) {
                  onNavigateBooking({ groupName: group.groupName });
                }
              }}
              className="relative h-[400px] rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <img
                src={group.image}
                alt={group.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white flex flex-col justify-end">
                <h3 className="font-serif text-2xl sm:text-3xl font-normal mb-2">
                  {group.title}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm font-light mb-6 line-clamp-2 leading-relaxed">
                  {group.subtitle}
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:translate-x-2 transition-transform duration-300">
                  <span>Ver variações</span>
                  <ArrowRight className="w-4 h-4 text-[#e5ded8]" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}