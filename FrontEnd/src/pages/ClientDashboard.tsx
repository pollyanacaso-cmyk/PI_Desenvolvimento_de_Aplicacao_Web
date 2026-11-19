import { useState, useEffect } from 'react';
import { lerClienteSalvo, lerToken, ouvirSessao, type ClienteLogado } from '../utils/sessao';
import Header from '../components/layout/Header';
import ConfirmModal from '../components/ui/ConfirmModal';

export interface ClientDashboardProps {
  onNavigateHome?: () => void;
  onNavigateProfessionals?: () => void;
  onNavigateBooking?: () => void;
  onLogout?: () => void;
}

export default function ClientDashboard({
  onNavigateHome,
  onNavigateProfessionals,
  onNavigateBooking,
  onLogout
}: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'painel' | 'agendamentos'>('painel');
  const [filtro, setFiltro] = useState<'todos' | 'futuros' | 'concluidos' | 'cancelados'>('todos');
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState<any | null>(null);
  const [usuario, setUsuario] = useState<ClienteLogado | null>(() => lerClienteSalvo());
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<string>('');

  // Mantém o usuário sincronizado com a sessão salva (login/logout em qualquer lugar)
  useEffect(() => ouvirSessao(() => setUsuario(lerClienteSalvo())), []);

  const clienteId = usuario?.id;

  // Busca os agendamentos reais do cliente logado. Roda de novo se a conta mudar.
  useEffect(() => {
    // Sem usuário válido: nada de agendamentos (nem os de uma sessão anterior)
    if (!clienteId) {
      setAgendamentos([]);
      setLoading(false);
      return;
    }

    let cancelado = false;
    setAgendamentos([]);
    setLoading(true);

    const fetchMeusAgendamentos = async () => {
      try {
        const token = lerToken();
        const response = await fetch(`http://localhost:3000/agendamentos?cliente_id=${clienteId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (cancelado) return;

        // Trava extra: mesmo que a API devolva algo a mais, só entram os desta conta
        const lista: any[] = Array.isArray(data) ? data : [];
        setAgendamentos(lista.filter((a) => Number(a.cliente_id ?? a.Cliente?.id) === Number(clienteId)));
      } catch (err) {
        console.error('Erro ao carregar agendamentos:', err);
        if (!cancelado) setAgendamentos([]);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    fetchMeusAgendamentos();
    return () => {
      cancelado = true;
    };
  }, [clienteId]);

  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Cliente';
  const podeCancelar = (item: any) => {
    if (!item.data || !item.horario_inicio || item.status === 'Cancelado' || item.status === 'Concluído') {
      return false;
    }

    // O cliente pode cancelar até 23h59min59s do dia anterior ao atendimento.
    // A data é interpretada no fuso local do navegador.
    const [ano, mes, dia] = String(item.data).slice(0, 10).split('-').map(Number);
    const dataHoraAgendamento = new Date(ano, mes - 1, dia);

    if (Number.isNaN(dataHoraAgendamento.getTime())) return false;

    const limiteCancelamento = new Date(ano, mes - 1, dia - 1, 23, 59, 59, 999);
    return Date.now() <= limiteCancelamento.getTime();
  };
  const cancelarAgendamento = async (id: number) => {
    setCancelandoId(id); setMensagem('');
    try {
      const token = lerToken();
      const resp = await fetch(`http://localhost:3000/agendamentos/${id}/cancelar`, { method: 'PATCH', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body.mensagem || 'Não foi possível cancelar.');
      setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelado' } : a));
      setMensagem('Agendamento cancelado com sucesso.');
    } catch (e) { setMensagem(e instanceof Error ? e.message : 'Erro ao cancelar.'); }
    finally { setCancelandoId(null); setAgendamentoParaCancelar(null); }
  };
  const iniciais = usuario?.nome 
    ? usuario.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
    : 'CL';

  // ---- Derivados ----
  const hojeInicio = new Date(); hojeInicio.setHours(0, 0, 0, 0);
  const dataDe = (a: any) => new Date(`${String(a.data).slice(0, 10)}T${String(a.horario_inicio || '00:00').slice(0, 5)}:00`);
  const ehFuturo = (a: any) => a.status !== 'Cancelado' && a.status !== 'Concluído' && !!a.data && dataDe(a) >= hojeInicio;
  const formatarDataBR = (d?: string) => {
    const [y, m, dia] = String(d ?? '').slice(0, 10).split('-');
    return y && m && dia ? `${dia}/${m}/${y}` : String(d ?? '');
  };
  const formatarPreco = (v: unknown) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
  const estiloStatus = (status?: string) => {
    switch (status) {
      case 'Cancelado': return 'bg-rose-50 text-rose-600';
      case 'Concluído': return 'bg-[#f0ece9] text-[#6e635f]';
      case 'Pendente': return 'bg-amber-50 text-amber-600';
      default: return 'bg-emerald-50 text-emerald-600';
    }
  };

  const futuros = agendamentos.filter(ehFuturo).sort((a, b) => dataDe(a).getTime() - dataDe(b).getTime());
  const proximoAgendamento = futuros[0];
  const agendamentosFuturos = futuros.length;
  const atendimentosRealizados = agendamentos.filter(a => a.status === 'Concluído').length;
  const diasParaProximo = proximoAgendamento
    ? Math.max(0, Math.round((new Date(`${String(proximoAgendamento.data).slice(0, 10)}T00:00:00`).getTime() - hojeInicio.getTime()) / 86400000))
    : null;

  const listaFiltrada = (() => {
    const base = [...agendamentos];
    if (filtro === 'futuros') return base.filter(ehFuturo).sort((a, b) => dataDe(a).getTime() - dataDe(b).getTime());
    const filtrada = filtro === 'concluidos' ? base.filter(a => a.status === 'Concluído')
      : filtro === 'cancelados' ? base.filter(a => a.status === 'Cancelado')
      : base;
    return filtrada.sort((a, b) => dataDe(b).getTime() - dataDe(a).getTime());
  })();
  const FILTROS: { id: typeof filtro; rotulo: string }[] = [
    { id: 'todos', rotulo: 'Todos' },
    { id: 'futuros', rotulo: 'Futuros' },
    { id: 'concluidos', rotulo: 'Concluídos' },
    { id: 'cancelados', rotulo: 'Cancelados' }
  ];

  // Card reutilizado no Painel e na aba Agendamentos
  const renderCard = (item: any) => (
    <div key={item.id} className="bg-white border border-[#f0ece9] rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-semibold text-[#3a2e2b]">{item.Servico?.nome || 'Serviço'}</h3>
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${estiloStatus(item.status)}`}>
            {item.status || 'Agendado'}
          </span>
        </div>
        <p className="text-xs text-[#a09692] mb-1">com {item.Profissional?.nome || 'Profissional'}</p>
        <p className="text-xs text-[#a09692]">{formatarDataBR(item.data)} às {String(item.horario_inicio || '').substring(0, 5)}</p>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#f0ece9]">
        <span className="font-semibold text-[#a3644f] text-sm">{formatarPreco(item.Servico?.preco)}</span>
        {podeCancelar(item) && (
          <button
            onClick={() => setAgendamentoParaCancelar(item)}
            disabled={cancelandoId === item.id}
            className="border border-rose-200 text-rose-500 text-xs px-4 py-2 rounded-xl font-medium hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelandoId === item.id ? 'Cancelando...' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col">
      <Header currentPage="dashboard" onNavigateHome={onNavigateHome} onNavigateProfessionals={onNavigateProfessionals} onNavigateDashboard={() => {}} onLogout={onLogout} usuarioNome={primeiroNome} usuarioTipo="cliente" />
      <div className="flex flex-1 flex-col md:flex-row">
      {/* Sidebar Esquerda (Navegação da Área do Cliente) */}
      <aside className="w-full md:w-64 border-r border-[#f0ece9] bg-white p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Título da área */}
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-[#a3644f]">
            Área do cliente
          </p>

          {/* Cartão de Identificação do Utilizador */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8f5f2] border border-[#f0ece9] mb-8">
            <div className="w-10 h-10 rounded-full bg-[#e5ded8] text-[#3a2e2b] font-semibold text-xs flex items-center justify-center shrink-0">
              {iniciais}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-[#3a2e2b] truncate">{usuario?.nome || 'Maria Silva'}</h4>
              <p className="text-[11px] text-[#a09692]">Cliente desde 2024</p>
            </div>
          </div>

          {/* Menu Lateral */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('painel')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'painel' 
                  ? 'bg-[#a3644f] text-white shadow-sm' 
                  : 'text-[#a09692] hover:bg-[#f8f5f2] hover:text-[#3a2e2b]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Painel
            </button>

            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'agendamentos' 
                  ? 'bg-[#a3644f] text-white shadow-sm' 
                  : 'text-[#a09692] hover:bg-[#f8f5f2] hover:text-[#3a2e2b]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendamentos
            </button>
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="pt-6 border-t border-[#f0ece9] space-y-2">
          <button
            onClick={onNavigateBooking}
            className="w-full bg-[#a3644f] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#8a4f3d] transition-all cursor-pointer shadow-sm"
          >
            + Novo agendamento
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full text-rose-600 hover:bg-rose-50 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-center"
            >
              Sair da conta
            </button>
          )}
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#3a2e2b]">
              {activeTab === 'painel' ? `Olá, ${primeiroNome}!` : 'Meus agendamentos'}
            </h1>
            <p className="text-[#a09692] text-sm mt-1">
              {activeTab === 'painel'
                ? 'Bem-vinda ao seu painel. Veja seus próximos agendamentos.'
                : 'Acompanhe todos os agendamentos que você solicitou.'}
            </p>
          </div>
          <button onClick={onNavigateHome} className="px-4 py-2.5 rounded-xl border border-[#e5ded8] bg-white text-xs font-semibold hover:border-[#a3644f] cursor-pointer">Voltar para a página inicial</button>
        </div>
        {mensagem && <p className="mb-4 p-3 rounded-xl bg-[#f8f5f2] text-xs text-[#6e635f]">{mensagem}</p>}

        {activeTab === 'painel' ? (
          <>
            {proximoAgendamento ? (
              <div className="bg-[#a3644f] text-white rounded-3xl p-6 md:p-8 mb-8 shadow-md">
                <span className="text-xs uppercase tracking-wider text-white/80 font-semibold mb-4 block">Próximo agendamento</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-white/70 mb-1">Serviço</p>
                    <h3 className="font-semibold text-xl">{proximoAgendamento.Servico?.nome || 'Serviço Agendado'}</h3>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Profissional</p>
                    <h3 className="font-semibold text-xl">{proximoAgendamento.Profissional?.nome || 'Profissional do Salão'}</h3>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Data</p>
                    <p className="font-semibold text-lg">{formatarDataBR(proximoAgendamento.data)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Horário</p>
                    <p className="font-semibold text-lg">{String(proximoAgendamento.horario_inicio || '').substring(0, 5)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20 flex flex-wrap justify-between items-center gap-4">
                  <span className="text-sm font-medium">Valor: <strong>{formatarPreco(proximoAgendamento.Servico?.preco)}</strong></span>
                  <span className="bg-white/20 text-white text-xs px-4 py-1.5 rounded-full font-semibold">{proximoAgendamento.status || 'Agendado'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#f0ece9] rounded-3xl p-8 mb-8 text-center shadow-sm">
                <p className="text-[#a09692] text-sm mb-4">Você ainda não tem próximos agendamentos.</p>
                <button onClick={onNavigateBooking} className="bg-[#a3644f] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#8a4f3d] transition-all cursor-pointer">Agendar agora</button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-white border border-[#f0ece9] rounded-2xl p-6 text-center shadow-sm">
                <span className="font-serif text-4xl font-semibold text-[#3a2e2b] block mb-1">{agendamentosFuturos}</span>
                <p className="font-semibold text-xs text-[#3a2e2b]">Agendamentos</p>
                <p className="text-[11px] text-[#a09692]">futuros</p>
              </div>
              <div className="bg-white border border-[#f0ece9] rounded-2xl p-6 text-center shadow-sm">
                <span className="font-serif text-4xl font-semibold text-[#3a2e2b] block mb-1">{atendimentosRealizados}</span>
                <p className="font-semibold text-xs text-[#3a2e2b]">Atendimentos</p>
                <p className="text-[11px] text-[#a09692]">realizados</p>
              </div>
              <div className="bg-white border border-[#f0ece9] rounded-2xl p-6 text-center shadow-sm">
                <span className="font-serif text-4xl font-semibold text-[#3a2e2b] block mb-1">{diasParaProximo ?? '—'}</span>
                <p className="font-semibold text-xs text-[#3a2e2b]">Próximo em</p>
                <p className="text-[11px] text-[#a09692]">{diasParaProximo === 1 ? 'dia' : 'dias'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-[#3a2e2b]">Próximos agendamentos</h2>
                {futuros.length > 3 && (
                  <button onClick={() => { setFiltro('futuros'); setActiveTab('agendamentos'); }} className="text-xs font-semibold text-[#a3644f] hover:underline cursor-pointer">Ver todos</button>
                )}
              </div>
              {loading ? (
                <p className="text-xs text-[#a09692]">Carregando agendamentos...</p>
              ) : futuros.length === 0 ? (
                <p className="text-xs text-[#a09692]">Nenhum agendamento futuro.</p>
              ) : (
                <div className="space-y-3">{futuros.slice(0, 3).map(renderCard)}</div>
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    filtro === f.id ? 'bg-[#a3644f] border-[#a3644f] text-white' : 'bg-white border-[#e5ded8] text-[#6e635f] hover:border-[#a3644f]'
                  }`}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>
            {loading ? (
              <p className="text-xs text-[#a09692]">Carregando agendamentos...</p>
            ) : listaFiltrada.length === 0 ? (
              <div className="bg-white border border-[#f0ece9] rounded-3xl p-8 text-center shadow-sm">
                <p className="text-[#a09692] text-sm">Nenhum agendamento encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">{listaFiltrada.map(renderCard)}</div>
            )}
          </div>
        )}
      </main>
      </div>
    <ConfirmModal
        aberto={!!agendamentoParaCancelar}
        titulo="Cancelar agendamento?"
        descricao={agendamentoParaCancelar && (
          <>
            Você está cancelando <strong className="text-[#3a2e2b]">{agendamentoParaCancelar.Servico?.nome || 'este serviço'}</strong> com{' '}
            {agendamentoParaCancelar.Profissional?.nome || 'a profissional'} em{' '}
            <strong className="text-[#3a2e2b]">{formatarDataBR(agendamentoParaCancelar.data)}</strong> às{' '}
            <strong className="text-[#3a2e2b]">{String(agendamentoParaCancelar.horario_inicio || '').substring(0, 5)}</strong>.
            Essa ação não pode ser desfeita.
          </>
        )}
        textoVoltar="Manter agendamento"
        textoConfirmar="Confirmar cancelamento"
        carregando={cancelandoId !== null}
        onVoltar={() => setAgendamentoParaCancelar(null)}
        onConfirmar={() => agendamentoParaCancelar && cancelarAgendamento(agendamentoParaCancelar.id)}
      />
    </div>
  );
}
