import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

/*
  TELA DE SERVIÇOS:
  - Exibe a lista de serviços oferecidos pelo salão Ke Bella.
  - Permite filtrar por categorias (ex: Todos, Cabelo, Unhas, Estética Facial).
  - Conecta com o BackEnd (/api/servicos) para buscar os dados reais ou usa mock de fallback.
  - Ao clicar em "Agendar", direciona o usuário para o fluxo de agendamento.
*/

interface Service {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao_minutos: number;
  categoria?: string;
  imagem_url?: string;
}

interface ServicesProps {
  onSelectService?: (service: Service) => void;
}

export default function Services({ onSelectService }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Busca a lista de serviços do BackEnd
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('http://localhost:3000/api/servicos');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          // Fallback para dados mocados se o BackEnd ainda não tiver dados no BD
          setServices(defaultServices);
        }
      } catch (err) {
        // Se a API estiver offline, utiliza os dados mocados idênticos ao Figma
        setServices(defaultServices);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, []);

  const categories = [
    { id: 'todos', label: 'Todos os Serviços' },
    { id: 'cabelo', label: 'Cabelo & Penteados' },
    { id: 'unhas', label: 'Manicure & Pedicure' },
    { id: 'estetica', label: 'Estética Facial & Corporal' }
  ];

  const filteredServices = selectedCategory === 'todos' 
    ? services 
    : services.filter(s => s.categoria?.toLowerCase() === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho da Página */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Nossos Serviços
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Experiências Exclusivas de Beleza
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Escolha o tratamento ideal para realçar a sua beleza natural. Atendimento personalizado com os melhores profissionais.
          </p>
        </div>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <Filter className="w-4 h-4 text-slate-400 mr-2 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lista de Cards de Serviços */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6">
                  {/* Tag de Categoria */}
                  {service.categoria && (
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                      {service.categoria}
                    </span>
                  )}
                  
                  <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                    {service.nome}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {service.descricao}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-rose-500" />
                      {service.duracao_minutos} min
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Atendimento VIP
                    </span>
                  </div>
                </div>

                {/* Footer do Card com Preço e Ação */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Valor</span>
                    <span className="text-xl font-bold text-slate-900">
                      R$ {Number(service.preco).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectService && onSelectService(service)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// Dados de backup idênticos aos definidos no Figma/Protótipo
const defaultServices: Service[] = [
  {
    id: 1,
    nome: 'Corte & Escova Modeladora',
    descricao: 'Lavagem especial com tratamento de nutrição, corte personalizado conforme visagismo e finalização com escova.',
    preco: 120.00,
    duracao_minutos: 60,
    categoria: 'cabelo'
  },
  {
    id: 2,
    nome: 'Coloração & Mechas Iluminadas',
    descricao: 'Técnica de iluminação dos fios preservando a saúde capilar, inclui reconstrução pós-química.',
    preco: 350.00,
    duracao_minutos: 150,
    categoria: 'cabelo'
  },
  {
    id: 3,
    nome: 'Manicure & Pedicure Spa',
    descricao: 'Cutilagem contínua, esmaltação de alta durabilidade, esfoliação com sais e massagem relaxante nos pés e mãos.',
    preco: 85.00,
    duracao_minutos: 75,
    categoria: 'unhas'
  },
  {
    id: 4,
    nome: 'Limpeza de Pele Profunda',
    descricao: 'Remoção de impurezas, extração de cravos, alta frequência e máscara hidratante calmante com LEDterapia.',
    preco: 180.00,
    duracao_minutos: 90,
    categoria: 'estetica'
  },
  {
    id: 5,
    nome: 'Design de Sobrancelhas com Henna',
    descricao: 'Mapeamento facial, remoção com pinça/linha e aplicação de henna de tom proporcional.',
    preco: 65.00,
    duracao_minutos: 45,
    categoria: 'estetica'
  }
];