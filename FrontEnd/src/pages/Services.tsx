import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Eye, 
  Feather, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  Plus, 
  ArrowRight,
  ArrowLeft,
  UserCheck,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import type { ItemCarrinho } from '../components/ui/CartBar';
import Header from '../components/layout/Header';


interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: number | string;
  duracao_minutos: number;
  grupo?: string;
  variacao?: string;
}

interface Profissional {
  id: number;
  nome: string;
  especializacao?: string;
}

export interface ServicesProps {
  onNavigateBooking?: (params?: { servicosSelecionados?: any[] }) => void;
  onNavigateHome?: () => void;
  onNavigateProfessionals?: () => void;
  categoriaInicial?: string;
  itensCarrinho: ItemCarrinho[];
  setItensCarrinho: React.Dispatch<React.SetStateAction<ItemCarrinho[]>>;
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
  usuarioNome?: string;
  usuarioTipo?: 'cliente' | 'admin' | 'profissional';
}

const IMAGENS_SERVICOS: Record<string, string> = {
  corte: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600',
  coloracao: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
  progressiva: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600',
  selante: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
  botox: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=600',
  unhas: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600',
  sobrancelha: 'https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&q=80&w=600',
  depilacao: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600',
  padrao: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600'
};

const CATEGORIAS = [
  {
    id: 'cabelos',
    nome: 'Cabelos',
    descricao: 'Cortes, colorações, progressivas, botox, selantes, definitivas e tratamentos capilares.',
    icone: Scissors,
    imagem: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
    subabas: [
      { id: 'corte', nome: 'Cortes', grupo: 'Corte' },
      { id: 'coloracao', nome: 'Colorações', grupo: 'Coloracao' },
      { id: 'progressiva', nome: 'Progressivas', grupo: 'Progressiva' },
      { id: 'selante', nome: 'Selantes', grupo: 'Selante' },
      { id: 'botox', nome: 'Botox Capilar', grupo: 'Botox' },
      { id: 'hidratacao', nome: 'Hidratações', grupo: 'Hidratacao' },
      { id: 'definitiva', nome: 'Definitiva', grupo: 'Definitiva' },
      { id: 'finalizacao', nome: 'Finalizações & Penteados', grupo: 'Finalizacao' }
    ]
  },
  {
    id: 'manicure',
    nome: 'Manicure & Pedicure',
    descricao: 'Serviços de manicure, pedicure, esmaltações e cuidados para pés e mãos.',
    icone: Sparkles,
    imagem: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
    subabas: []
  },
  {
    id: 'sobrancelha',
    nome: 'Sobrancelhas',
    descricao: 'Design de sobrancelhas, henna e micropigmentação.',
    icone: Eye,
    imagem: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    subabas: []
  },
  {
    id: 'depilacao',
    nome: 'Depilação',
    descricao: 'Depilação facial e corporal por área desejada.',
    icone: Feather,
    imagem: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&q=80&w=800',
    subabas: []
  }
];

export default function Services({ 
  onNavigateHome, 
  onNavigateProfessionals,
  categoriaInicial,
  itensCarrinho,
  setItensCarrinho, onNavigateLogin, onNavigateDashboard, onLogout, usuarioNome, usuarioTipo
}: ServicesProps) {
  const [catAtiva, setCatAtiva] = useState<typeof CATEGORIAS[0] | null>(() => {
    if (categoriaInicial) {
      return CATEGORIAS.find(c => c.id === categoriaInicial) || null;
    }
    return null;
  });

  const [subAbaAtiva, setSubAbaAtiva] = useState<string>('corte');
  
  const [servicosDoBanco, setServicosDoBanco] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuAbertoServicoId, setMenuAbertoServicoId] = useState<number | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoriaInicial) {
      const encontrada = CATEGORIAS.find(c => c.id === categoriaInicial);
      if (encontrada) setCatAtiva(encontrada);
    }
  }, [categoriaInicial]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [resServicos, resProf] = await Promise.all([
          fetch('http://localhost:3000/servicos'),
          fetch('http://localhost:3000/profissionais')
        ]);

        if (resServicos.ok) setServicosDoBanco(await resServicos.json());
        if (resProf.ok) setProfissionais(await resProf.json());
      } catch (err) {
        console.error('Erro ao conectar com a API:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const scrollCarrossel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const amount = clientWidth * 0.75;
      carouselRef.current.scrollTo({
        left: dir === 'left' ? scrollLeft - amount : scrollLeft + amount,
        behavior: 'smooth'
      });
    }
  };

  const removerAcentos = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const obterProfissionaisPorServico = (servico: Servico) => {
    const grupo = removerAcentos(servico.grupo || '');
    const nome = removerAcentos(servico.nome || '');

    if (
      grupo.includes('depilac') || 
      nome.includes('depilac') || 
      nome.includes('buco') || 
      nome.includes('virilha') || 
      nome.includes('perna') || 
      nome.includes('axila')
    ) {
      const filtrados = profissionais.filter(p => {
        const n = removerAcentos(p.nome);
        return n.includes('lucimara') || n.includes('simone');
      });
      return removerDuplicados(filtrados);
    }

    if (
      grupo.includes('unha') || 
      grupo.includes('manicure') || 
      grupo.includes('pedicure') || 
      nome.includes('unha') || 
      nome.includes('manicure') || 
      nome.includes('pedicure') || 
      nome.includes('esmaltac')
    ) {
      const filtrados = profissionais.filter(p => {
        const n = removerAcentos(p.nome);
        return n.includes('simone') || n.includes('ana sunta');
      });
      return removerDuplicados(filtrados);
    }

    if (
      grupo.includes('sobrancelha') || 
      nome.includes('sobrancelha') || 
      nome.includes('micropigmentac') || 
      nome.includes('henna')
    ) {
      const filtrados = profissionais.filter(p => removerAcentos(p.nome).includes('lucimara'));
      return removerDuplicados(filtrados);
    }

    const termosCabelo = ['corte', 'coloracao', 'progressiva', 'selante', 'botox', 'hidratacao', 'definitiva', 'finalizacao', 'escova', 'chapinha', 'penteado', 'cabelo'];
    const eCabelo = termosCabelo.some(t => grupo.includes(t) || nome.includes(t)) || catAtiva?.id === 'cabelos';

    if (eCabelo) {
      const filtrados = profissionais.filter(p => removerAcentos(p.nome).includes('wagner'));
      return removerDuplicados(filtrados);
    }

    return removerDuplicados(profissionais);
  };

  const removerDuplicados = (lista: Profissional[]) => {
    const mapaUnico = new Map<string, Profissional>();
    lista.forEach(p => {
      const chaveNome = removerAcentos(p.nome.trim());
      if (!mapaUnico.has(chaveNome)) {
        mapaUnico.set(chaveNome, p);
      }
    });
    return Array.from(mapaUnico.values());
  };

  const toggleServico = (servico: Servico) => {
    setItensCarrinho((prev) => {
      const existe = prev.some((item) => item.servico.id === servico.id);
      if (existe) {
        return prev.filter((item) => item.servico.id !== servico.id);
      } else {
        const elegiveis = obterProfissionaisPorServico(servico);
        const profPadrao = elegiveis[0];
        return [
          ...prev, 
          { 
            servico, 
            profissionalId: profPadrao?.id,
            profissionalNome: profPadrao?.nome 
          }
        ];
      }
    });
  };

  const setProfissionalParaServico = (servicoId: number, prof: Profissional) => {
    setItensCarrinho((prev) =>
      prev.map((item) =>
        item.servico.id === servicoId 
          ? { 
              ...item, 
              profissionalId: prof.id,
              profissionalNome: prof.nome
            } 
          : item
      )
    );
    setMenuAbertoServicoId(null);
  };

  const servicosFiltrados = servicosDoBanco
    .filter((s) => {
      if (!catAtiva) return false;

      const grupo = removerAcentos(s.grupo || '');
      const nome = removerAcentos(s.nome || '');

      if (grupo === 'unhas' || nome.includes('unha') || nome.includes('manicure') || nome.includes('pedicure')) {
        return catAtiva.id === 'manicure';
      }

      if (catAtiva.id === 'cabelos') {
        const subObj = catAtiva.subabas.find((sub) => sub.id === subAbaAtiva);
        if (!subObj) return false;
        
        const grupoDesejado = removerAcentos(subObj.grupo);

        if (grupo) return grupo.includes(grupoDesejado);

        if (subAbaAtiva === 'corte') return nome.includes('corte') && !nome.includes('unha');
        if (subAbaAtiva === 'coloracao') return nome.includes('coloracao') || nome.includes('raiz');
        if (subAbaAtiva === 'progressiva') return nome.includes('progressiva');
        if (subAbaAtiva === 'selante') return nome.includes('selante');
        if (subAbaAtiva === 'botox') return nome.includes('botox');
        if (subAbaAtiva === 'hidratacao') return nome.includes('hidratacao');
        if (subAbaAtiva === 'definitiva') return nome.includes('definitiva');
        if (subAbaAtiva === 'finalizacao') return nome.includes('escova') || nome.includes('chapinha') || nome.includes('penteado');

        return false;
      }

      if (catAtiva.id === 'manicure') {
        return grupo === 'unhas' || nome.includes('manicure') || nome.includes('pedicure') || nome.includes('unha');
      }

      if (catAtiva.id === 'sobrancelha') {
        return grupo === 'sobrancelha' || nome.includes('sobrancelha') || nome.includes('micropigmentac') || nome.includes('henna');
      }

      if (catAtiva.id === 'depilacao') {
        return grupo === 'depilacao' || nome.includes('depilac') || nome.includes('buco') || nome.includes('virilha') || nome.includes('perna') || nome.includes('axila');
      }

      return false;
    })
    .sort((a, b) => {
      if (catAtiva?.id === 'manicure') {
        const obterPrioridade = (nomeStr: string) => {
          const n = nomeStr.toLowerCase();
          if (n.startsWith('manicure (serviço completo)') || n === 'manicure') return 1;
          if (n.startsWith('pedicure (serviço completo)') || n === 'pedicure') return 2;
          if (n.includes('manicure e pedicure (serviço completo)')) return 3;
          if (n.includes('manicure e pedicure masculino')) return 4;
          if (n.includes('esmaltação das mãos')) return 5;
          if (n.includes('esmaltação dos pés')) return 6;
          return 99;
        };
        return obterPrioridade(a.nome) - obterPrioridade(b.nome);
      }
      return a.id - b.id;
    });

  const formatarMinutos = (min: number) => {
    if (!min) return '0 min';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const obterImagemServico = (servico: Servico) => {
    const grupo = removerAcentos(servico.grupo || '');
    return IMAGENS_SERVICOS[grupo] || IMAGENS_SERVICOS.padrao;
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] pb-36 font-sans">
      <Header currentPage="services" onNavigateHome={onNavigateHome} onNavigateProfessionals={onNavigateProfessionals} onNavigateServices={onNavigateHome} onNavigateLogin={onNavigateLogin} onNavigateDashboard={onNavigateDashboard} onLogout={onLogout} usuarioNome={usuarioNome} usuarioTipo={usuarioTipo} carrinhoCount={itensCarrinho.length} mostrarBotaoAgendar={false} />      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ded8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0ece9] pb-5">
            <div>
              {onNavigateHome && (
                <button 
                  onClick={onNavigateHome}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f8f5f2] hover:bg-[#e5ded8] text-xs font-semibold text-[#3a2e2b] transition-all cursor-pointer mb-3"
                >
                  <ArrowLeft className="w-4 h-4 text-[#a3644f]" /> Voltar ao Início
                </button>
              )}
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#a3644f] block">
                Catálogo Ke Bella
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#3a2e2b] font-light mt-1">
                {catAtiva ? catAtiva.nome : 'Selecione uma Categoria'}
              </h1>
            </div>

            {catAtiva && (
              <button
                onClick={() => { setCatAtiva(null); setSubAbaAtiva('corte'); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f8f5f2] border border-[#e5ded8] rounded-2xl text-xs font-bold text-[#3a2e2b] hover:bg-[#a3644f] hover:text-white hover:border-[#a3644f] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <LayoutGrid className="w-4 h-4" /> Ver Todas as Categorias
              </button>
            )}
          </div>

          {/* BARRA DE NAVEGAÇÃO DE CATEGORIAS */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
              {CATEGORIAS.map((cat) => {
                const Icone = cat.icone;
                const ativa = catAtiva?.id === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCatAtiva(cat); setSubAbaAtiva('corte'); }}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
                      ativa
                        ? 'bg-[#a3644f] text-white ring-2 ring-[#a3644f]/30'
                        : 'bg-[#f8f5f2] text-[#6e635f] border border-[#e5ded8] hover:bg-white hover:text-[#3a2e2b]'
                    }`}
                  >
                    <Icone className={`w-4 h-4 ${ativa ? 'text-white' : 'text-[#a3644f]'}`} />
                    <span>{cat.nome}</span>
                  </button>
                );
              })}
            </div>

            {/* CONTROLES DE NAVEGAÇÃO DO CARROSSEL */}
            {catAtiva && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => scrollCarrossel('left')}
                  className="p-3 rounded-2xl bg-[#f8f5f2] hover:bg-[#a3644f] hover:text-white text-[#3a2e2b] transition-all cursor-pointer shadow-xs border border-[#e5ded8]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollCarrossel('right')}
                  className="p-3 rounded-2xl bg-[#f8f5f2] hover:bg-[#a3644f] hover:text-white text-[#3a2e2b] transition-all cursor-pointer shadow-xs border border-[#e5ded8]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 1. SELEÇÃO INICIAL DAS CATEGORIAS */}
        {!catAtiva ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIAS.map((cat) => {
              const Icone = cat.icone;
              return (
                <div
                  key={cat.id}
                  onClick={() => { setCatAtiva(cat); setSubAbaAtiva('corte'); }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-[#f0ece9] flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={cat.imagem} 
                      alt={cat.nome} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-[#a3644f] shadow-md">
                      <Icone className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-[#3a2e2b] font-medium group-hover:text-[#a3644f] transition-colors mb-2">
                        {cat.nome}
                      </h3>
                      <p className="text-xs text-[#6e635f] leading-relaxed line-clamp-3">
                        {cat.descricao}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#f8f5f2] flex items-center justify-between text-xs font-semibold text-[#a3644f]">
                      <span>Ver Serviços</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (

          /* 2. LISTAGEM DOS SERVIÇOS */
          <div className="space-y-6">
            
            {/* SUB-ABAS DE CABELOS */}
            {catAtiva.subabas.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {catAtiva.subabas.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubAbaAtiva(sub.id)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                      subAbaAtiva === sub.id
                        ? 'bg-[#a3644f] text-white'
                        : 'bg-white text-[#6e635f] border border-[#e5ded8] hover:bg-[#f8f5f2]'
                    }`}
                  >
                    {sub.nome}
                  </button>
                ))}
              </div>
            )}

            {/* CARROSSEL DE CARDS DE SERVIÇO */}
            {loading ? (
              <div className="py-16 text-center text-xs text-[#a09692]">Carregando serviços do banco de dados...</div>
            ) : servicosFiltrados.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-[#f0ece9] p-8 text-xs text-[#a09692]">
                Nenhum serviço encontrado cadastrado no banco para este filtro.
              </div>
            ) : (
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
              >
                {servicosFiltrados.map((servico) => {
                  const itemNoCarrinho = itensCarrinho.find((i) => i.servico.id === servico.id);
                  const estaSelecionado = !!itemNoCarrinho;
                  const precoNum = Number(servico.preco || 0);
                  const profissionaisElegiveis = obterProfissionaisPorServico(servico);
                  const profAtual = profissionaisElegiveis.find(p => p.id === itemNoCarrinho?.profissionalId) || profissionaisElegiveis[0];
                  const menuAberto = menuAbertoServicoId === servico.id;

                  return (
                    <div
                      key={servico.id}
                      className={`min-w-[300px] sm:min-w-[340px] max-w-[360px] bg-white rounded-3xl overflow-hidden border transition-all duration-300 snap-start flex flex-col justify-between shadow-xs hover:shadow-md ${
                        estaSelecionado 
                          ? 'border-[#a3644f] ring-2 ring-[#a3644f]/20 bg-[#fdfbfb]' 
                          : 'border-[#f0ece9]'
                      }`}
                    >
                      <div className="relative h-40 overflow-hidden bg-gray-100">
                        <img 
                          src={obterImagemServico(servico)} 
                          alt={servico.nome} 
                          className="w-full h-full object-cover"
                        />
                        {servico.variacao && (
                          <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider bg-white/95 backdrop-blur-md text-[#a3644f] px-3 py-1 rounded-full shadow-xs">
                            {servico.variacao}
                          </span>
                        )}
                      </div>

                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-lg text-[#3a2e2b] font-medium leading-snug">
                            {servico.nome}
                          </h4>

                          <p className="text-xs text-[#6e635f] leading-relaxed line-clamp-2 mt-1">
                            {servico.descricao || 'Atendimento profissional completo.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#a09692] font-semibold border-t border-[#f8f5f2] pt-3">
                          <Clock className="w-4 h-4 text-[#a3644f]" />
                          <span>Duração estimada: <strong className="text-[#3a2e2b] font-bold">{formatarMinutos(servico.duracao_minutos)}</strong></span>
                        </div>

                        {/* SELEÇÃO DO PROFISSIONAL */}
                        {estaSelecionado && profissionaisElegiveis.length > 0 && (
                          <div className="pt-2 relative">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#3a2e2b] mb-1.5 flex items-center gap-1">
                              <UserCheck className="w-4 h-4 text-[#a3644f]" /> 
                              <span>Profissional</span>
                            </label>

                            {profissionaisElegiveis.length === 1 ? (
                              <div className="w-full p-3.5 bg-[#f8f5f2] border border-[#e5ded8] rounded-2xl flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-[#3a2e2b]">
                                    {profAtual?.nome}
                                  </p>
                                  {profAtual?.especializacao && (
                                    <p className="text-xs text-[#6e635f] mt-0.5">
                                      {profAtual.especializacao}
                                    </p>
                                  )}
                                </div>
                                <Check className="w-4 h-4 text-[#a3644f]" />
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setMenuAbertoServicoId(menuAberto ? null : servico.id)}
                                  className="w-full p-3.5 bg-[#f8f5f2] hover:bg-[#f0ece9] border border-[#e5ded8] rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer shadow-xs"
                                >
                                  <div className="truncate pr-2">
                                    <p className="text-sm font-semibold text-[#3a2e2b] truncate">
                                      {profAtual?.nome}
                                    </p>
                                    {profAtual?.especializacao && (
                                      <p className="text-xs text-[#6e635f] truncate mt-0.5">
                                        {profAtual.especializacao}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronDown className={`w-5 h-5 text-[#a3644f] transition-transform duration-200 flex-shrink-0 ${menuAberto ? 'rotate-180' : ''}`} />
                                </button>

                                {menuAberto && (
                                  <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-2xl border border-[#e5ded8] shadow-2xl z-40 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                    {profissionaisElegiveis.map((p) => {
                                      const selecionado = profAtual?.id === p.id;
                                      return (
                                        <button
                                          key={p.id}
                                          type="button"
                                          onClick={() => setProfissionalParaServico(servico.id, p)}
                                          className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                                            selecionado 
                                              ? 'bg-[#a3644f]/10 text-[#a3644f] font-semibold' 
                                              : 'hover:bg-[#f8f5f2] text-[#3a2e2b]'
                                          }`}
                                        >
                                          <div>
                                            <p className="text-sm font-medium">{p.nome}</p>
                                            {p.especializacao && (
                                              <p className="text-xs text-[#a09692] font-normal mt-0.5">{p.especializacao}</p>
                                            )}
                                          </div>
                                          {selecionado && <Check className="w-4 h-4 text-[#a3644f]" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-6 bg-[#fcfbfa] border-t border-[#f0ece9] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#a09692] font-semibold block">Valor</span>
                          <span className="font-serif text-xl font-bold text-[#3a2e2b]">
                            R$ {precoNum.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleServico(servico)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            estaSelecionado
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-[#a3644f] hover:bg-[#8a4f3d] text-white'
                          }`}
                        >
                          {estaSelecionado ? (
                            <>
                              <Check className="w-4 h-4" /> Selecionado
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Adicionar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}