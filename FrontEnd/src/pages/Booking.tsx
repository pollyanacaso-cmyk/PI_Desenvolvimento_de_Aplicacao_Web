import { useState, useEffect, useMemo, type FormEvent } from 'react';
import HeaderBooking from '../components/layout/HeaderBooking';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Scissors,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import type { ItemCarrinho } from '../components/ui/CartBar';
import { lerToken, type ClienteLogado } from '../utils/sessao';
import {
  ALMOCO_INICIO_MIN,
  ALMOCO_FIM_MIN,
  gerarSlots,
  horarioParaMinutos,
  simularSequencia,
  todasDisponiveis,
  encontrarOrdemSemConflito,
  separarConflitantes,
  type EtapaLinhaDoTempo,
  type IntervaloOcupado
} from '../utils/agendamento';

const API_URL = 'http://localhost:3000';
const ENDERECO_SALAO = 'Av. Senador Kennedy, 230 - Vila Centenário - Esp. Sto do Pinhal';

interface BookingProps {
  onNavigateHome?: () => void;
  onNavigateServices?: () => void;
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
  onLimparCarrinho?: () => void;
  // Opcional: mantém no carrinho apenas o que ainda falta agendar (itens "pendentes")
  onAtualizarCarrinho?: (itens: ItemCarrinho[]) => void;
  clienteLogado?: ClienteLogado | null;
  agendamentoDados?: {
    servicosSelecionados?: ItemCarrinho[];
  };
}

interface AgendaItemApi {
  profissional_id: number | string;
  horario_inicio: string;
  horario_fim: string;
}

const SLOTS = gerarSlots();
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatarData(ano: number, mesIndex: number, dia: number): string {
  return `${ano}-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function formatarDataBR(dataStr: string): string {
  return dataStr.split('-').reverse().join('/');
}

function formatarPreco(valor: number | string): string {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

export function Booking({
  onNavigateHome,
  onNavigateServices,
  onNavigateLogin,
  onNavigateDashboard,
  onLogout,
  onLimparCarrinho,
  onAtualizarCarrinho,
  clienteLogado,
  agendamentoDados
}: BookingProps) {
  // Cliente autenticado: vem do App (que mantém a sessão sincronizada com o
  // localStorage). Sem sessão no App, a tela de bloqueio pede o login.
  const clienteAutenticado = useMemo<ClienteLogado | null>(
    () => (clienteLogado?.id ? clienteLogado : null),
    [clienteLogado]
  );

  // O carrinho entra uma única vez (o Booking é montado a cada navegação).
  const [itensOrdenados, setItensOrdenados] = useState<ItemCarrinho[]>(
    () => agendamentoDados?.servicosSelecionados ?? []
  );
  const [itensAdiados, setItensAdiados] = useState<ItemCarrinho[]>([]);

  const hojeStr = useMemo(() => {
    const d = new Date();
    return formatarData(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [mesAtual, setMesAtual] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dataSelecionada, setDataSelecionada] = useState<string>(hojeStr);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>('');

  const [ocupadosDia, setOcupadosDia] = useState<IntervaloOcupado[]>([]);
  const [profissionaisDomingoLiberado, setProfissionaisDomingoLiberado] = useState<number[]>([]);
  const [domingosLiberadosMes, setDomingosLiberadosMes] = useState<Record<string, number[]>>({});
  const [agendaVersao, setAgendaVersao] = useState<number>(0); // força recarregar a agenda
  const [carregandoAgenda, setCarregandoAgenda] = useState<boolean>(false);
  const [avisoAgenda, setAvisoAgenda] = useState<string | null>(null);

  const [enviando, setEnviando] = useState<boolean>(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [agendamentoConcluido, setAgendamentoConcluido] = useState<boolean>(false);
  const [resumoFinalizado, setResumoFinalizado] = useState<EtapaLinhaDoTempo[]>([]);
  const [dataFinalizada, setDataFinalizada] = useState<string>('');

  // Agenda do dia (agendamentos + bloqueios de todos os profissionais)
  useEffect(() => {
    let cancelado = false;

    async function carregarAgenda() {
      setCarregandoAgenda(true);
      setAvisoAgenda(null);
      try {
        const res = await fetch(`${API_URL}/agendamentos/agenda-dia?data=${dataSelecionada}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const dados: { agendamentos?: AgendaItemApi[]; bloqueios?: AgendaItemApi[]; profissionaisComDomingoLiberado?: number[] } = await res.json();
        if (!cancelado) setProfissionaisDomingoLiberado(dados.profissionaisComDomingoLiberado ?? []);
        const lista: IntervaloOcupado[] = [...(dados.agendamentos ?? []), ...(dados.bloqueios ?? [])].map(
          (o) => ({
            profissional_id: Number(o.profissional_id),
            inicioMin: horarioParaMinutos(o.horario_inicio),
            fimMin: horarioParaMinutos(o.horario_fim)
          })
        );

        if (!cancelado) setOcupadosDia(lista);
      } catch (err) {
        console.error('Erro ao buscar agenda do dia:', err);
        if (!cancelado) {
          setOcupadosDia([]);
          setAvisoAgenda(
            'Não foi possível carregar a agenda deste dia. A disponibilidade será conferida novamente ao confirmar.'
          );
        }
      } finally {
        if (!cancelado) setCarregandoAgenda(false);
      }
    }

    carregarAgenda();
    return () => {
      cancelado = true;
    };
  }, [dataSelecionada, agendaVersao]);

  // Consulta quais domingos foram liberados pelos profissionais no mês exibido.
  useEffect(() => {
    let ativo = true;
    const ano = mesAtual.getFullYear(); const mes = mesAtual.getMonth();
    const total = new Date(ano, mes + 1, 0).getDate();
    const domingos = Array.from({ length: total }, (_, i) => i + 1)
      .filter(dia => new Date(ano, mes, dia).getDay() === 0)
      .map(dia => formatarData(ano, mes, dia));
    Promise.all(domingos.map(async data => {
      try { const r = await fetch(`${API_URL}/agendamentos/agenda-dia?data=${data}`); const j = await r.json(); return [data, j.profissionaisComDomingoLiberado || []] as const; }
      catch { return [data, []] as const; }
    })).then(resultados => { if (ativo) setDomingosLiberadosMes(Object.fromEntries(resultados)); });
    return () => { ativo = false; };
  }, [mesAtual]);

  // Início mínimo do dia selecionado (se for hoje, não oferece horários que já passaram)
  const agoraMin = useMemo(() => {
    if (dataSelecionada !== hojeStr) return -1;
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, [dataSelecionada, hojeStr]);

  const statusSlots = useMemo(() => {
    const mapa: Record<string, 'passado' | 'livre' | 'conflito'> = {};
    const domingoSelecionado = new Date(`${dataSelecionada}T12:00:00`).getDay() === 0 && itensOrdenados.some(item => !profissionaisDomingoLiberado.includes(Number(item.profissionalId)));
    for (const slot of SLOTS) {
      if (domingoSelecionado) { mapa[slot] = 'conflito'; continue; }
      const inicioMin = horarioParaMinutos(slot);
      if (inicioMin <= agoraMin) {
        mapa[slot] = 'passado';
      } else if (itensOrdenados.length === 0) {
        mapa[slot] = 'conflito';
      } else {
        mapa[slot] = todasDisponiveis(simularSequencia(itensOrdenados, inicioMin, ocupadosDia))
          ? 'livre'
          : 'conflito';
      }
    }
    return mapa;
  }, [itensOrdenados, ocupadosDia, agoraMin, dataSelecionada, profissionaisDomingoLiberado]);

  const haSlotNoDia = SLOTS.some((s) => statusSlots[s] !== 'passado');

  const linhaDoTempoAtual = useMemo(() => {
    if (!horarioSelecionado || itensOrdenados.length === 0) return [];
    return simularSequencia(itensOrdenados, horarioParaMinutos(horarioSelecionado), ocupadosDia);
  }, [horarioSelecionado, itensOrdenados, ocupadosDia]);

  const etapasComConflito = linhaDoTempoAtual.filter((e) => !e.disponivel);
  const temConflitoAtual = etapasComConflito.length > 0;
  const terminoPrevisto = linhaDoTempoAtual.length
    ? linhaDoTempoAtual[linhaDoTempoAtual.length - 1].fimStr
    : '';

  // Botão 1: existe outra ordem em que tudo cabe no mesmo horário?
  const ordemAlternativaSemConflito = useMemo(() => {
    if (!temConflitoAtual || !horarioSelecionado) return null;
    return encontrarOrdemSemConflito(
      itensOrdenados,
      horarioParaMinutos(horarioSelecionado),
      ocupadosDia
    );
  }, [temConflitoAtual, horarioSelecionado, itensOrdenados, ocupadosDia]);

  // Botão 2: o que dá para agendar agora e o que fica pendente?
  const separacao = useMemo(() => {
    if (!temConflitoAtual || !horarioSelecionado) return null;
    return separarConflitantes(itensOrdenados, horarioParaMinutos(horarioSelecionado), ocupadosDia);
  }, [temConflitoAtual, horarioSelecionado, itensOrdenados, ocupadosDia]);

  const handleReordenarAutomaticamente = () => {
    if (ordemAlternativaSemConflito) {
      setItensOrdenados(ordemAlternativaSemConflito);
    }
  };

  const handleSepararItensConflitantes = () => {
    if (!separacao) return;
    setItensOrdenados(separacao.mantidos);
    setItensAdiados((prev) => [...prev, ...separacao.adiados]);
  };

  // Reordenação manual (setas ↑ / ↓)
  const removerItem = (idx: number) => {
    setItensOrdenados(prev => prev.filter((_, i) => i !== idx));
    setHorarioSelecionado('');
  };

  const moverItem = (idx: number, direcao: -1 | 1) => {
    const novoIdx = idx + direcao;
    if (novoIdx < 0 || novoIdx >= itensOrdenados.length) return;
    const copia = [...itensOrdenados];
    const [removido] = copia.splice(idx, 1);
    copia.splice(novoIdx, 0, removido);
    setItensOrdenados(copia);
  };

  const valorTotal = itensOrdenados.reduce((acc, item) => acc + Number(item.servico.preco || 0), 0);

  // Desfaz agendamentos já criados quando um dos serviços da sequência falha,
  // para não deixar o cliente com a reserva pela metade.
  const desfazerCriados = async (ids: number[], token: string | null) => {
    await Promise.all(
      ids.map((id) =>
        fetch(`${API_URL}/agendamentos/${id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }).catch(() => undefined)
      )
    );
  };

  // Envio: um POST por serviço, na ordem exata do cronograma
  const handleFinalizar = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral(null);

    if (!clienteAutenticado) {
      setErroGeral('Você precisa estar logado para concluir o agendamento.');
      return;
    }

    if (!dataSelecionada || !horarioSelecionado || itensOrdenados.length === 0) {
      setErroGeral('Selecione uma data, um horário e ao menos um serviço.');
      return;
    }

    if (temConflitoAtual) {
      setErroGeral('Resolva o conflito de horário antes de confirmar o agendamento.');
      return;
    }

    setEnviando(true);
    const token = lerToken();
    const criadosIds: number[] = [];

    try {
      for (const etapa of linhaDoTempoAtual) {
        const res = await fetch(`${API_URL}/agendamentos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            cliente_id: clienteAutenticado.id,
            profissional_id: etapa.item.profissionalId,
            servico_id: etapa.item.servico.id,
            data: dataSelecionada,
            horario_inicio: `${etapa.inicioStr}:00`,
            horario_fim: `${etapa.fimStr}:00`,
            status: 'Agendado'
          })
        });

        const corpo = await res.json().catch(() => ({}));

        if (!res.ok) {
          const detalhe = Array.isArray(corpo.erros) && corpo.erros.length ? ` ${corpo.erros.join(' ')}` : '';
          throw new Error(
            `${corpo.mensagem || `Erro ao agendar ${etapa.item.servico.nome}.`}${detalhe} (${etapa.item.servico.nome})`
          );
        }

        if (corpo?.agendamento?.id) criadosIds.push(Number(corpo.agendamento.id));
      }

      setResumoFinalizado(linhaDoTempoAtual);
      setDataFinalizada(dataSelecionada);
      setAgendamentoConcluido(true);

      // O carrinho passa a conter apenas o que ficou pendente
      if (onAtualizarCarrinho) {
        onAtualizarCarrinho(itensAdiados);
      } else if (itensAdiados.length === 0 && onLimparCarrinho) {
        onLimparCarrinho();
      }
    } catch (err) {
      if (criadosIds.length > 0) {
        await desfazerCriados(criadosIds, token);
      }
      setErroGeral(
        (err instanceof Error ? err.message : 'Falha ao registrar o agendamento.') +
          (criadosIds.length > 0 ? ' Nenhum serviço desta reserva foi confirmado.' : '')
      );
      // Alguém pode ter ocupado o horário nesse meio tempo: atualiza a grade
      setAgendaVersao((v) => v + 1);
    } finally {
      setEnviando(false);
    }
  };

  const handleAgendarPendentes = () => {
    setItensOrdenados(itensAdiados);
    setItensAdiados([]);
    setHorarioSelecionado('');
    setResumoFinalizado([]);
    setErroGeral(null);
    setAgendamentoConcluido(false);
    setAgendaVersao((v) => v + 1); // a agenda mudou com o que acabamos de reservar
  };

  // Calendário mensal
  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    const celulas: Array<{ dia: number | null; dataStr?: string }> = [];
    for (let i = 0; i < primeiroDiaSemana; i++) celulas.push({ dia: null });
    for (let d = 1; d <= totalDias; d++) {
      celulas.push({ dia: d, dataStr: formatarData(ano, mes, d) });
    }
    return celulas;
  }, [mesAtual]);

  const nomeMesFormatado = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const noMesAtualReal = mesAtual.getFullYear() === Number(hojeStr.slice(0, 4)) &&
    mesAtual.getMonth() === Number(hojeStr.slice(5, 7)) - 1;

  // ---------- TELA DE BLOQUEIO (NÃO LOGADO) ----------
  if (!clienteAutenticado) {
    const totalItens = itensOrdenados.length;
    return (
      <div className="min-h-screen bg-[#f8f5f2] text-[#3a2e2b] flex flex-col font-sans">
        <HeaderBooking onNavigateHome={onNavigateHome} onNavigateLogin={onNavigateLogin} onNavigateServices={onNavigateServices} carrinhoCount={totalItens} />
        <main className="flex-1 flex flex-col justify-center items-center p-6 text-center max-w-md mx-auto space-y-5">
          <div className="w-16 h-16 bg-[#a3644f]/10 text-[#a3644f] rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-light">Identifique-se para Agendar</h1>
          <p className="text-xs text-[#6e635f] leading-relaxed">
            Para garantir a reserva do seu horário no <strong>Ke Bella</strong>, é necessário entrar na sua conta.{' '}
            {totalItens > 0 && (
              <>
                Seus <strong>{totalItens} serviço(s)</strong> continuarão salvos no carrinho e você voltará direto
                para esta tela após o login.
              </>
            )}
          </p>
          <div className="flex items-center gap-3 pt-2">
            {onNavigateServices && (
              <button
                onClick={onNavigateServices}
                className="px-5 py-3 bg-white border border-[#e5ded8] text-[#3a2e2b] text-xs font-semibold rounded-full hover:bg-[#f0ece9] transition-colors cursor-pointer"
              >
                Voltar aos Serviços
              </button>
            )}
            <button
              onClick={onNavigateLogin}
              className="px-6 py-3 bg-[#a3644f] text-white text-xs font-semibold rounded-full hover:bg-[#8a4f3d] transition-colors cursor-pointer shadow-sm"
            >
              Fazer Login / Cadastrar
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---------- TELA DE SUCESSO ----------
  if (agendamentoConcluido) {
    const formatarValor = (v: unknown) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
    const totalReserva = resumoFinalizado.reduce((acc, et) => acc + Number(et.item.servico.preco || 0), 0);
    return (
      <div className="min-h-screen bg-[#f8f5f2] text-[#3a2e2b] flex flex-col font-sans">
        <HeaderBooking onNavigateHome={onNavigateHome} onNavigateLogin={onNavigateLogin} onNavigateServices={onNavigateServices} onNavigateDashboard={onNavigateDashboard} onLogout={onLogout} usuarioNome={clienteAutenticado.nome.split(' ')[0]} />

        <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3a2e2b] mb-2">Agendamento confirmado!</h1>
          <p className="text-sm text-[#6e635f] max-w-md mb-8">
            Obrigada, <strong>{clienteAutenticado.nome.split(' ')[0]}</strong>! Seus horários para o dia{' '}
            <strong>{formatarDataBR(dataFinalizada)}</strong> foram reservados.
          </p>

          <div className="w-full max-w-lg space-y-4 mb-6">
            {resumoFinalizado.map((et, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e5ded8] px-6 py-5 shadow-sm text-sm">
                {[
                  ['Serviço', et.item.servico.nome],
                  ['Profissional', et.item.profissionalNome || 'A definir'],
                  ['Data', formatarDataBR(dataFinalizada)],
                  ['Horário', `${et.inicioStr} – ${et.fimStr}`],
                  ['Valor', formatarValor(et.item.servico.preco)]
                ].map(([rotulo, valor]) => (
                  <div key={rotulo} className="flex justify-between items-center py-1.5">
                    <span className="text-[#a09692]">{rotulo}</span>
                    <span className={`font-semibold text-right ${rotulo === 'Valor' ? 'text-[#a3644f]' : 'text-[#3a2e2b]'}`}>{valor}</span>
                  </div>
                ))}
              </div>
            ))}
            {resumoFinalizado.length > 1 && (
              <div className="flex justify-between items-center px-6 text-sm">
                <span className="text-[#a09692]">Total</span>
                <span className="font-bold text-[#3a2e2b]">{formatarValor(totalReserva)}</span>
              </div>
            )}
          </div>

          {itensAdiados.length > 0 && (
            <div className="w-full max-w-lg bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-3 mb-6">
              <p className="text-xs text-amber-900 font-medium">
                Você ainda tem <strong>{itensAdiados.length} serviço(s)</strong> pendente(s) para agendar em outro
                horário ou dia:
              </p>
              <ul className="text-xs text-amber-950 list-disc pl-5 space-y-0.5">
                {itensAdiados.map((it, i) => (
                  <li key={i}>{it.servico.nome}</li>
                ))}
              </ul>
              <button
                onClick={handleAgendarPendentes}
                className="w-full py-2.5 bg-[#a3644f] text-white text-xs font-semibold rounded-xl hover:bg-[#8a4f3d] transition-colors cursor-pointer"
              >
                Agendar Serviço(s) Pendente(s) Agora
              </button>
            </div>
          )}

          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e5ded8] px-6 py-4 text-left mb-8">
            <p className="text-xs font-semibold text-[#3a2e2b] mb-1">Endereço do salão</p>
            <p className="text-xs text-[#6e635f]">{ENDERECO_SALAO}</p>
          </div>

          <div className="w-full max-w-lg flex flex-col items-center gap-3">
            {onNavigateDashboard && (
              <button
                onClick={onNavigateDashboard}
                className="w-full py-3.5 bg-[#a3644f] text-white text-sm font-semibold rounded-xl hover:bg-[#8a4f3d] transition-colors cursor-pointer shadow-sm"
              >
                Ver meus agendamentos
              </button>
            )}
            <button
              onClick={onNavigateHome}
              className="px-5 py-2 bg-white border border-[#e5ded8] text-[#3a2e2b] text-xs font-semibold rounded-full hover:bg-[#f0ece9] transition-colors cursor-pointer"
            >
              Voltar ao início
            </button>
          </div>
        </main>
      </div>
    );
  }

  const desabilitarConfirmar =
    enviando || !horarioSelecionado || temConflitoAtual || itensOrdenados.length === 0;

  const renderSlot = (slot: string) => {
    const status = statusSlots[slot];
    const ativo = horarioSelecionado === slot;
    const domingoBloqueado = new Date(`${dataSelecionada}T12:00:00`).getDay() === 0 && itensOrdenados.some(item => !profissionaisDomingoLiberado.includes(Number(item.profissionalId)));
    const desabilitado = status === 'passado' || itensOrdenados.length === 0 || domingoBloqueado;

    return (
      <button
        type="button"
        key={slot}
        disabled={desabilitado}
        onClick={() => setHorarioSelecionado(slot)}
        title={status === 'conflito' ? 'Há conflito para algum serviço neste horário' : undefined}
        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
          ativo
            ? 'bg-[#a3644f] text-white border-[#a3644f] shadow-xs cursor-pointer'
            : desabilitado
            ? 'bg-[#f3efec] text-[#c9bfb9] border-[#ece6e1] line-through cursor-not-allowed'
            : status === 'livre'
            ? 'bg-[#f8f5f2] text-[#3a2e2b] border-[#e5ded8] hover:border-[#a3644f] cursor-pointer'
            : 'bg-amber-50/50 text-[#6e635f] border-amber-200/80 hover:border-amber-400 cursor-pointer'
        }`}
      >
        {slot}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#3a2e2b] flex flex-col font-sans">
      <HeaderBooking
        onNavigateHome={onNavigateHome}
        onNavigateLogin={onNavigateLogin}
        onNavigateServices={onNavigateServices}
        onNavigateDashboard={onNavigateDashboard}
        onLogout={onLogout}
        usuarioNome={clienteAutenticado.nome.split(' ')[0]}
        carrinhoCount={itensOrdenados.length + itensAdiados.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between border-b border-[#e5ded8] pb-6">
          <div>
            {onNavigateServices && (
              <button
                onClick={onNavigateServices}
                className="text-xs font-semibold text-[#a09692] hover:text-[#3a2e2b] flex items-center gap-1 transition-colors cursor-pointer mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Catálogo
              </button>
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-[#a3644f] block">
              Olá, {clienteAutenticado.nome}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light">Escolha a Data &amp; Horário</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA ESQUERDA */}
          <form onSubmit={handleFinalizar} className="lg:col-span-7 space-y-6">
            {/* CALENDÁRIO */}
            <div className="bg-white p-6 rounded-3xl border border-[#e5ded8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={noMesAtualReal}
                  onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}
                  className="p-2 rounded-xl hover:bg-[#f8f5f2] text-[#3a2e2b] cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="font-serif text-lg capitalize font-medium text-[#3a2e2b]">{nomeMesFormatado}</h2>
                <button
                  type="button"
                  onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}
                  className="p-2 rounded-xl hover:bg-[#f8f5f2] text-[#3a2e2b] cursor-pointer"
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#a09692]">
                {DIAS_SEMANA.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center">
                {diasDoMes.map((cel, idx) => {
                  if (!cel.dia || !cel.dataStr) return <div key={`vazio-${idx}`} />;
                  const dataStr = cel.dataStr;
                  const domingo = new Date(`${dataStr}T12:00:00`).getDay() === 0;
                  const liberadosData = domingosLiberadosMes[dataStr] || [];
                  const domingoLiberado = itensOrdenados.length > 0 && itensOrdenados.every(item => liberadosData.includes(Number(item.profissionalId)));
                  const bloqueado = dataStr < hojeStr || (domingo && !domingoLiberado); // dias passados ou domingos sem liberação
                  const selecionado = dataStr === dataSelecionada;
                  const ehHoje = dataStr === hojeStr;

                  return (
                    <button
                      type="button"
                      key={dataStr}
                      disabled={bloqueado}
                      onClick={() => {
                        setDataSelecionada(dataStr);
                        setHorarioSelecionado('');
                      }}
                      className={`h-10 rounded-xl text-xs font-medium transition-all flex items-center justify-center ${
                        selecionado
                          ? 'bg-[#a3644f] text-white font-bold shadow-xs cursor-pointer'
                          : bloqueado
                          ? 'bg-rose-50/60 text-rose-300 line-through cursor-not-allowed'
                          : ehHoje
                          ? 'border border-[#a3644f] text-[#a3644f] font-bold hover:bg-[#f8f5f2] cursor-pointer'
                          : 'text-[#3a2e2b] hover:bg-[#f8f5f2] cursor-pointer'
                      }`}
                    >
                      {cel.dia}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-[#f0ece9] text-[11px] text-[#6e635f]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#a3644f] inline-block" /> Selecionado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border border-[#a3644f] inline-block" /> Hoje
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-50 border border-rose-200 inline-block" /> Bloqueado / Passado
                </span>
              </div>
            </div>

            {/* GRADE DE HORÁRIOS */}
            <div className="bg-white p-6 rounded-3xl border border-[#e5ded8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3a2e2b] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#a3644f]" /> Horário de Início (a cada 20 min)
                </span>
                {carregandoAgenda && <span className="text-[11px] text-[#a09692]">Atualizando agenda...</span>}
              </div>

              {avisoAgenda && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px]">
                  {avisoAgenda}
                </div>
              )}

              {!haSlotNoDia ? (
                <p className="text-xs text-[#6e635f]">
                  Não há mais horários disponíveis hoje. Escolha outra data no calendário.
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-[#a09692] block mb-2">
                      Manhã (08:00 – 12:00)
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {SLOTS.filter((s) => horarioParaMinutos(s) < ALMOCO_INICIO_MIN).map(renderSlot)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-[#a09692] block mb-2">
                      Tarde (13:30 – 20:00)
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {SLOTS.filter((s) => horarioParaMinutos(s) >= ALMOCO_FIM_MIN).map(renderSlot)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6e635f] pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#f8f5f2] border border-[#e5ded8] inline-block" /> Livre
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200 inline-block" /> Com conflito
                    </span>
                  </div>
                </div>
              )}

              {/* CRONOGRAMA EM CASCATA */}
              {horarioSelecionado && linhaDoTempoAtual.length > 0 && (
                <div className="pt-4 border-t border-[#f0ece9] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#3a2e2b]">
                      Cronograma do Atendimento
                    </h3>
                    <span className="text-[11px] text-[#6e635f]">
                      {horarioSelecionado} → {terminoPrevisto}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {linhaDoTempoAtual.map((etapa, i) => (
                      <div
                        key={`${etapa.item.servico.id}-${i}`}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs ${
                          etapa.disponivel
                            ? 'bg-emerald-50/50 border-emerald-200 text-[#3a2e2b]'
                            : 'bg-rose-50 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {etapa.inicioStr} – {etapa.fimStr}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 font-medium">
                              {etapa.item.servico.duracao_minutos} min
                            </span>
                          </div>
                          <p className="font-semibold">{etapa.item.servico.nome}</p>
                          <p className="text-[11px] opacity-80">
                            Profissional: <strong>{etapa.item.profissionalNome || 'A definir'}</strong>
                          </p>
                          {!etapa.disponivel && etapa.motivoConflito && (
                            <p className="text-[11px] font-semibold text-rose-700 pt-1">⚠️ {etapa.motivoConflito}</p>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                            etapa.disponivel ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {etapa.disponivel ? 'Livre' : 'Indisponível'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ALERTA DE CONFLITO + 2 AÇÕES */}
                  {temConflitoAtual && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-950 space-y-1">
                          <p className="font-bold">
                            {etapasComConflito.length === 1
                              ? '1 serviço indisponível'
                              : `${etapasComConflito.length} serviços indisponíveis`}{' '}
                            às {horarioSelecionado}
                          </p>
                          <p className="text-amber-900/90 leading-relaxed">
                            {ordemAlternativaSemConflito || (separacao && separacao.mantidos.length > 0)
                              ? 'Escolha uma opção abaixo ou selecione outro horário.'
                              : 'Nenhum ajuste resolve este horário. Escolha outro horário ou outra data.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        {/* BOTÃO 1 — INVERTER ORDEM / AUTO-REORDENAR */}
                        {ordemAlternativaSemConflito && (
                          <button
                            type="button"
                            onClick={handleReordenarAutomaticamente}
                            className="flex-1 py-2.5 px-4 bg-[#3a2e2b] hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Inverter Ordem para Caber às {horarioSelecionado}</span>
                          </button>
                        )}

                        {/* BOTÃO 2 — AGENDAR ITEM INDISPONÍVEL SEPARADO */}
                        {separacao && separacao.mantidos.length > 0 && separacao.adiados.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSepararItensConflitantes}
                            className="flex-1 py-2.5 px-4 bg-white border border-amber-400 hover:bg-amber-100 text-amber-950 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <Scissors className="w-3.5 h-3.5 text-[#a3644f]" />
                            <span>
                              Agendar {separacao.adiados.length === 1 ? 'Item Indisponível' : 'Itens Indisponíveis'}{' '}
                              Separado
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {erroGeral && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium">
                {erroGeral}
              </div>
            )}

            <button
              type="submit"
              disabled={desabilitarConfirmar}
              className={`w-full py-4 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all ${
                desabilitarConfirmar ? 'bg-[#cbbab3] cursor-not-allowed' : 'bg-[#a3644f] hover:bg-[#8a4f3d] cursor-pointer'
              }`}
            >
              {enviando ? 'Confirmando Reserva...' : 'Confirmar e Agendar'}
            </button>
          </form>

          {/* COLUNA DIREITA: ORDEM DOS SERVIÇOS */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#e5ded8] shadow-xs space-y-4">
            <div className="border-b border-[#f0ece9] pb-3 flex items-center justify-between gap-2">
              <h2 className="font-serif text-xl">Ordem dos Serviços</h2>
              <span className="text-[11px] text-[#a09692] text-right">Use as setas para ajustar a ordem</span>
            </div>

            {itensOrdenados.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-[#a09692]">Nenhum serviço selecionado no momento.</p>
                {onNavigateServices && (
                  <button
                    type="button"
                    onClick={onNavigateServices}
                    className="px-4 py-2 bg-[#a3644f] text-white text-xs font-semibold rounded-full hover:bg-[#8a4f3d] transition-colors cursor-pointer"
                  >
                    Escolher Serviços
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {itensOrdenados.map((item, idx) => (
                  <div
                    key={`${item.servico.id}-${idx}`}
                    className="p-3.5 bg-[#f8f5f2] rounded-2xl flex justify-between items-center gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#a3644f] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#3a2e2b] truncate">{item.servico.nome}</p>
                        <p className="text-[10px] text-[#a3644f] font-semibold flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3 h-3" /> {item.profissionalNome || 'Sem profissional'} •{' '}
                          {item.servico.duracao_minutos} min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[#3a2e2b]">R$ {formatarPreco(item.servico.preco)}</span>

                      <button type="button" onClick={() => removerItem(idx)} title="Remover serviço" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {itensOrdenados.length > 1 && (
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moverItem(idx, -1)}
                            className="p-0.5 text-[#6e635f] hover:text-[#a3644f] disabled:opacity-25 cursor-pointer"
                            title="Fazer este serviço antes"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === itensOrdenados.length - 1}
                            onClick={() => moverItem(idx, 1)}
                            className="p-0.5 text-[#6e635f] hover:text-[#a3644f] disabled:opacity-25 cursor-pointer"
                            title="Fazer este serviço depois"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PENDENTES PARA AGENDAR DEPOIS */}
            {itensAdiados.length > 0 && (
              <div className="pt-3 border-t border-[#f0ece9] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                  Pendentes para agendar depois ({itensAdiados.length})
                </span>
                {itensAdiados.map((item, idx) => (
                  <div
                    key={`${item.servico.id}-adiado-${idx}`}
                    className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex justify-between items-center text-xs"
                  >
                    <span className="text-amber-950 font-medium truncate">{item.servico.nome}</span>
                    <button type="button" onClick={() => setItensAdiados(prev => prev.filter((_, i) => i !== idx))} className="text-rose-600 p-1" title="Remover serviço pendente"><Trash2 size={14}/></button>
                    <button
                      type="button"
                      onClick={() => {
                        setItensOrdenados((prev) => [...prev, item]);
                        setItensAdiados((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-[11px] font-bold text-[#a3644f] hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Incluir de volta
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[#f0ece9] pt-4 flex justify-between items-center">
              <span className="text-xs text-[#6e635f]">Total desta reserva:</span>
              <span className="font-serif text-2xl font-bold text-[#a3644f]">R$ {formatarPreco(valorTotal)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Booking;
