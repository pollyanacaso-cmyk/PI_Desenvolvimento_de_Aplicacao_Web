import React, { useState } from 'react';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  onNavigateBooking?: () => void;
}

export function ServicesSection({ onNavigateBooking }: ServicesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'cabelo', name: 'Cabelo' },
    { id: 'unhas', name: 'Unhas' },
    { id: 'sobrancelhas', name: 'Sobrancelha' },
    { id: 'estetica', name: 'Maquiagem' },
    { id: 'depilacao', name: 'Depilação' },
  ];

  const allServices = [
    // CABELO
    {
      id: 'pintura',
      category: 'cabelo',
      title: 'Coloração',
      desc: 'Coloração profissional, mechas e iluminação personalizada.',
      duration: '90 min',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'penteados',
      category: 'cabelo',
      title: 'Penteados',
      desc: 'Penteados exclusivos para festas, casamentos e eventos.',
      duration: '60 min',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'selante-botox',
      category: 'cabelo',
      title: 'Selante & Botox Capilar',
      desc: 'Redução de frizz, alinhamento térmico e brilho espelhado.',
      duration: '90 min',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'progressiva',
      category: 'cabelo',
      title: 'Escova Progressiva',
      desc: 'Alisamento duradouro com máxima nutrição dos fios.',
      duration: '120 min',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'hidratacao',
      category: 'cabelo',
      title: 'Hidratação Profunda',
      desc: 'Restauração intensiva para cabelos secos ou quimicamente tratados.',
      duration: '45 min',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800'
    },

    // UNHAS
    {
      id: 'mao-pe',
      category: 'unhas',
      title: 'Mão e Pé (Esmaltação)',
      desc: 'Cutilagem russa, esmaltação impecável e hidratação das mãos.',
      duration: '60 min',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800'
    },

    // SOBRANCELHAS
    {
      id: 'sobrancelha-design',
      category: 'sobrancelhas',
      title: 'Design de Sobrancelha',
      desc: 'Mapeamento facial para um desenho harmonioso e natural.',
      duration: '30 min',
      image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'henna',
      category: 'sobrancelhas',
      title: 'Sobrancelha com Henna',
      desc: 'Definição e preenchimento de falhas com pigmentação natural.',
      duration: '40 min',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'micropigmentacao',
      category: 'sobrancelhas',
      title: 'Micropigmentação',
      desc: 'Técnica nanofios para sobrancelhas densas e hiper-realistas.',
      duration: '120 min',
      image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800'
    },

    // MAQUIAGEM
    {
      id: 'maquiagem',
      category: 'estetica',
      title: 'Maquiagem Profissional',
      desc: 'Maquiagem social com preparação de pele de alta durabilidade.',
      duration: '60 min',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800'
    },

    // DEPILAÇÃO
    {
      id: 'depilacao-area',
      category: 'depilacao',
      title: 'Depilação (por Área)',
      desc: 'Cuidado delicado com cera morna hipoalergênica e calmante.',
      duration: '30 min',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
    },
  ];

  const filteredServices = activeCategory === 'todos' 
    ? allServices 
    : allServices.filter(s => s.category === activeCategory);

  return (
    <section id="servicos" className="py-20 px-6 lg:px-12 bg-[#f8f5f2] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#6e635f] font-semibold block mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#a3644f]" />
            NOSSOS SEVIÇOS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3a2e2b]">
            Encontre o cuidado perfeito para você
          </h2>
        </div>

        {/* Abas de Filtro por Categoria */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#a3644f] text-white shadow-md'
                  : 'bg-white text-[#6e635f] hover:text-[#3a2e2b] border border-[#f0ece9]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grade de Cards com Fotos de Alta Resolução */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={onNavigateBooking}
              className="group bg-white rounded-3xl overflow-hidden border border-[#f0ece9] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Imagem Superior */}
              <div className="relative h-48 overflow-hidden bg-[#2c2825]">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#3a2e2b] flex items-center gap-1 shadow-sm">
                  <Clock className="w-3 h-3 text-[#a3644f]" />
                  {service.duration}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#3a2e2b] mb-1 group-hover:text-[#a3644f] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#6e635f] font-light leading-relaxed line-clamp-2">
                    {service.desc}
                  </p>
                </div>

                {/* Botão de Chamada */}
                <div className="mt-4 pt-3 border-t border-[#f0ece9] flex items-center justify-between text-xs font-semibold text-[#a3644f]">
                  <span>Agendar este serviço</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}