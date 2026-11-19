import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, Clock, ArrowRight, ChevronDown, ChevronUp, Trash2, X, User } from 'lucide-react';

export interface ItemCarrinho {
  servico: {
    id: number;
    nome: string;
    preco: number | string;
    duracao_minutos: number;
  };
  profissionalId?: number;
  profissionalNome?: string;
}

interface CartBarProps {
  itensCarrinho: ItemCarrinho[];
  onAvancar: () => void;
  onRemover: (servicoId: number) => void;
}

const formatarMinutos = (min: number) => {
  if (!min) return '0 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

const formatarPreco = (valor: number | string) =>
  `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;

export function CartBar({ itensCarrinho, onAvancar, onRemover }: CartBarProps) {
  const [listaAberta, setListaAberta] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const quantidade = itensCarrinho?.length ?? 0;

  // Fecha o painel quando o carrinho fica vazio
  useEffect(() => {
    if (quantidade === 0) setListaAberta(false);
  }, [quantidade]);

  // Fecha o painel ao clicar fora dele ou ao apertar ESC
  useEffect(() => {
    if (!listaAberta) return;

    const aoClicarFora = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setListaAberta(false);
      }
    };
    const aoApertarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setListaAberta(false);
    };

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('touchstart', aoClicarFora);
    document.addEventListener('keydown', aoApertarTecla);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('touchstart', aoClicarFora);
      document.removeEventListener('keydown', aoApertarTecla);
    };
  }, [listaAberta]);

  if (!itensCarrinho || quantidade === 0) return null;

  const valorTotal = itensCarrinho.reduce(
    (acc, item) => acc + Number(item.servico.preco || 0),
    0
  );

  const tempoTotalMinutos = itensCarrinho.reduce(
    (acc, item) => acc + Number(item.servico.duracao_minutos || 0),
    0
  );

  return (
    <div ref={containerRef} className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50">
      {/* PAINEL DE SERVIÇOS SELECIONADOS */}
      {listaAberta && (
        <div className="absolute bottom-full mb-2.5 left-0 right-0 bg-white text-[#3a2e2b] border border-[#e5ded8] rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0ece9]">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#3a2e2b]">
              Serviços selecionados ({quantidade})
            </h3>
            <button
              type="button"
              onClick={() => setListaAberta(false)}
              aria-label="Fechar lista de serviços"
              className="p-1 rounded-full text-[#8a7b76] hover:text-[#3a2e2b] hover:bg-[#f8f5f2] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ul className="max-h-[45vh] overflow-y-auto divide-y divide-[#f0ece9]">
            {itensCarrinho.map(item => (
              <li
                key={item.servico.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#faf8f6] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#3a2e2b] truncate leading-snug">
                    {item.servico.nome}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#8a7b76]">
                    {item.profissionalNome && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#a3644f]" />
                        {item.profissionalNome}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#a3644f]" />
                      {formatarMinutos(Number(item.servico.duracao_minutos || 0))}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-semibold text-[#a3644f] whitespace-nowrap">
                  {formatarPreco(item.servico.preco)}
                </span>

                <button
                  type="button"
                  onClick={() => onRemover(item.servico.id)}
                  aria-label={`Remover ${item.servico.nome}`}
                  title="Remover serviço"
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* BARRA HORIZONTAL */}
      <div className="bg-[#3a2e2b] text-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xl border border-white/10 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="p-2.5 bg-[#a3644f] text-white rounded-xl shrink-0 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white">
              <span>
                {quantidade} {quantidade === 1 ? 'serviço' : 'serviços'}
              </span>
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-1 text-white/80 font-normal text-xs">
                <Clock className="w-3.5 h-3.5 text-[#a3644f]" />
                <span>Tempo Total: {formatarMinutos(tempoTotalMinutos)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setListaAberta(v => !v)}
              aria-expanded={listaAberta}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/25 bg-white/5 text-xs font-medium text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              {listaAberta ? 'Ocultar serviços' : 'Ver serviços'}
              {listaAberta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] font-bold tracking-wider text-white/50 uppercase">
              Total
            </span>
            <div className="text-lg sm:text-xl font-semibold text-white whitespace-nowrap leading-tight">
              {formatarPreco(valorTotal)}
            </div>
          </div>

          <button
            onClick={onAvancar}
            className="px-5 py-2.5 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95"
          >
            <span>Avançar para Agendar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartBar;