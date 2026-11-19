import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  LayoutDashboard, CalendarDays, Users, Clock3, FileSpreadsheet, LogOut,
  UserRound, Plus, Search, X, Download, RefreshCw
} from 'lucide-react';
import { lerToken } from '../utils/sessao';

const API = 'http://localhost:3000';
type User = { id: number; nome: string; email: string; tipo: 'admin' | 'profissional' };
type Tab = 'Dashboard' | 'Agendamentos' | 'Profissionais' | 'Disponibilidade' | 'Relatórios' | 'Clientes';
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateToday = () => new Date().toISOString().slice(0, 10);
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
const statusColor = (s: string) => s === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s === 'Pendente' || s === 'Agendado' ? 'bg-amber-50 text-amber-700 border-amber-200' : s === 'Cancelado' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200';

export default function AdminDashboard({ usuario, onLogout }: { usuario: User; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [bloqueios, setBloqueios] = useState<any[]>([]);
  const [profissionaisDomingoLiberado, setProfissionaisDomingoLiberado] = useState<number[]>([]);
  const [resumo, setResumo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(usuario.tipo === 'profissional' ? String(usuario.id) : '');
  const [dataSelecionada, setDataSelecionada] = useState(dateToday());
  const [dataInicial, setDataInicial] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [dataFinal, setDataFinal] = useState(dateToday());
  const [filtroProfissional, setFiltroProfissional] = useState('');
  const [modal, setModal] = useState<'bloqueio' | 'profissional' | 'cliente' | 'agendamento' | null>(null);
  const [profissionalEditando, setProfissionalEditando] = useState<any>(null);
  const [agendamentoDetalhe, setAgendamentoDetalhe] = useState<any>(null);
  const [clienteDetalhe, setClienteDetalhe] = useState<any>(null);
  const [form, setForm] = useState<any>({ nome: '', email: '', senha: '', especializacao: '', data: dateToday(), inicio: '11:00', fim: '12:00', motivo: '' });

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = lerToken();
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.mensagem || body.erro || `Erro ${response.status}`);
    }
    if (response.status === 204) return null;
    const type = response.headers.get('content-type') || '';
    return type.includes('application/json') ? response.json() : response.blob();
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true); setErro('');
    try {
      const [a, p, c, b, agendaDia] = await Promise.all([
        request('/agendamentos'), request('/profissionais'), usuario.tipo === 'admin' ? request('/clientes') : Promise.resolve([]),
        request(`/bloqueios?${usuario.tipo === 'profissional' ? '' : 'status=Bloqueado'}`),
        request(`/agendamentos/agenda-dia?data=${dataSelecionada}`)
      ]);
      setAgendamentos(Array.isArray(a) ? a : []);
      setProfissionais(Array.isArray(p) ? p : []);
      setClientes(Array.isArray(c) ? c : []);
      setBloqueios(Array.isArray(b) ? b.filter((x: any) => x.status === 'Bloqueado') : []);
      setProfissionaisDomingoLiberado(agendaDia?.profissionaisComDomingoLiberado || []);
    } catch (e: any) { setErro(e.message || 'Não foi possível carregar os dados.'); }
    finally { setLoading(false); }
  }, [request, usuario.tipo, dataSelecionada]);

  useEffect(() => { carregar(); }, [carregar]);

  const queryRelatorio = useMemo(() => {
    const q = new URLSearchParams();
    if (dataInicial) q.set('dataInicial', dataInicial);
    if (dataFinal) q.set('dataFinal', dataFinal);
    if (usuario.tipo === 'admin' && filtroProfissional) q.set('profissionalId', filtroProfissional);
    return q.toString();
  }, [dataInicial, dataFinal, filtroProfissional, usuario.tipo]);

  useEffect(() => {
    if (tab !== 'Relatórios') return;
    let ativo = true;
    request(`/relatorios/resumo?${queryRelatorio}`).then((d: any) => { if (ativo) setResumo(d.resumo || {}); }).catch((e: any) => setErro(e.message));
    return () => { ativo = false; };
  }, [tab, queryRelatorio, request]);

  const atualizarStatus = async (id: number, status: string) => {
    try { await request(`/agendamentos/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); await carregar(); }
    catch (e: any) { setErro(e.message); }
  };

  const criarBloqueio = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await request('/bloqueios', { method: 'POST', body: JSON.stringify({
        profissional_id: usuario.tipo === 'profissional' ? usuario.id : Number(profissionalSelecionado),
        data: form.data, horario_inicio: form.inicio, horario_fim: form.fim, motivo: form.motivo
      }) });
      setModal(null); await carregar();
    } catch (err: any) { setErro(err.message); }
  };
  const removerBloqueio = async (id: number) => {
    try { await request(`/bloqueios/${id}`, { method: 'DELETE' }); await carregar(); }
    catch (e: any) { setErro(e.message); }
  };
  const liberarDomingo = async () => {
    if (usuario.tipo === 'admin' && !profissionalSelecionado) { setErro('Selecione um profissional antes de liberar o domingo.'); return; }
    try { await request('/bloqueios/liberar-domingo', { method: 'POST', body: JSON.stringify({ data: dataSelecionada, profissional_id: Number(profissionalSelecionado || usuario.id) }) }); await carregar(); setErro('Domingo liberado para este profissional.'); }
    catch (e: any) { setErro(e.message); }
  };
  const salvarProfissional = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const editando = Boolean(profissionalEditando);
      const payload = { ...form };
      if (editando && !payload.senha) delete payload.senha;
      await request(editando ? `/profissionais/${profissionalEditando.id}` : '/profissionais', {
        method: editando ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setModal(null);
      setProfissionalEditando(null);
      setForm({ nome: '', email: '', senha: '', especializacao: '' });
      await carregar();
    } catch (err: any) { setErro(err.message); }
  };
  const exportar = async () => {
    try {
      const blob = await request(`/relatorios/excel?${queryRelatorio}`) as Blob;
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'relatorio-ke-bella.xlsx'; a.click(); URL.revokeObjectURL(url);
    } catch (e: any) { setErro(e.message); }
  };

  const menu: { label: Tab; icon: any; adminOnly?: boolean }[] = [
    { label: 'Dashboard', icon: LayoutDashboard }, { label: 'Agendamentos', icon: CalendarDays },
    { label: 'Profissionais', icon: Users, adminOnly: true }, { label: 'Disponibilidade', icon: Clock3 },
    { label: 'Relatórios', icon: FileSpreadsheet }, { label: 'Clientes', icon: UserRound, adminOnly: true }
  ];
  const listaAgendamentos = agendamentos.filter(a => (filtroStatus === 'Todos' || a.status === filtroStatus) &&
    (!busca || `${a.Cliente?.nome} ${a.Servico?.nome} ${a.Profissional?.nome}`.toLowerCase().includes(busca.toLowerCase())));
  const hoje = agendamentos.filter(a => String(a.data).slice(0, 10) === dateToday() && a.status !== 'Cancelado');
  const mes = dateToday().slice(0, 7);
  const atendimentosMes = agendamentos.filter(a => String(a.data).startsWith(mes) && a.status === 'Concluído');
  const faturamentoMes = atendimentosMes.reduce((s, a) => s + Number(a.Servico?.preco || 0), 0);
  const servicosPopulares = Object.values(agendamentos.reduce((acc: any, a) => {
    if (a.status === 'Cancelado') return acc;
    const nome = a.Servico?.nome || 'Serviço';
    acc[nome] = acc[nome] || { nome, qtd: 0 }; acc[nome].qtd++; return acc;
  }, {})).sort((a: any, b: any) => b.qtd - a.qtd).slice(0, 5);
  const maxPopular = Math.max(1, ...(servicosPopulares as any[]).map((x: any) => x.qtd));
  const slots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const heading = usuario.tipo === 'admin' ? 'ADMINISTRAÇÃO' : 'ÁREA DO PROFISSIONAL';
  return <div className="min-h-screen flex bg-[#f8f5f2] text-[#3a2e2b]">
    <aside className="w-60 shrink-0 bg-[#1e1613] text-white flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-white/10"><div className="font-serif italic text-2xl">Ke Bella</div><div className="text-[9px] tracking-widest text-white/50 mt-1">{heading}</div></div>
      <nav className="p-3 space-y-1 flex-1">{menu.filter(m => !m.adminOnly || usuario.tipo === 'admin').map(m => {
        const Icon = m.icon; return <button key={m.label} onClick={() => setTab(m.label)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${tab === m.label ? 'bg-[#40342e] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><Icon size={16}/>{m.label}</button>;
      })}</nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-5"><div className="w-9 h-9 rounded-full bg-[#563322] flex items-center justify-center text-xs font-bold">{initials(usuario.nome)}</div><div className="min-w-0"><div className="text-xs font-semibold truncate">{usuario.nome}</div><div className="text-[10px] text-white/50 truncate">{usuario.email}</div></div></div>
        <button onClick={onLogout} className="flex items-center gap-2 text-xs text-white/60 hover:text-white"><LogOut size={14}/> Sair</button>
      </div>
    </aside>
    <main className="flex-1 min-w-0 p-7 lg:px-10 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-7"><div><h1 className="font-serif text-3xl font-semibold">{tab}</h1><p className="text-sm text-[#a3644f] mt-1">{tab === 'Dashboard' ? `Visão geral — ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}` : tab === 'Agendamentos' ? 'Gerencie todos os horários' : tab === 'Disponibilidade' ? 'Controle os horários de cada profissional' : 'Acompanhe as informações do salão'}</p></div><button onClick={carregar} className="p-2.5 rounded-xl border border-[#e5ded8] bg-white text-[#a3644f]" title="Atualizar"><RefreshCw size={17}/></button></div>
        {erro && <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex justify-between">{erro}<button onClick={() => setErro('')}><X size={16}/></button></div>}
        {loading ? <div className="bg-white border border-[#e5ded8] rounded-2xl p-10 text-center text-sm text-[#a09692]">Carregando dados do Ke Bella...</div> : <>
        {tab === 'Dashboard' && <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              ['Agendamentos hoje', String(hoje.length), '+ agenda do dia', '#a3644f'],
              ['Total de clientes', String(clientes.length || new Set(agendamentos.map(a => a.cliente_id)).size), 'clientes cadastrados', '#2563eb'],
              ['Atendimentos no mês', String(atendimentosMes.length), 'serviços concluídos', '#d97706'],
              ['Faturamento (mês)', money(faturamentoMes), 'somente concluídos', '#16a34a']
            ].map(([label, value, sub, color]) => <div key={label} className="bg-white border border-[#e5ded8] rounded-2xl p-5"><p className="text-xs text-[#8d817b]">{label}</p><p className="font-serif text-3xl font-semibold mt-2" style={{ color }}>{value}</p><p className="text-[11px] text-[#a09692] mt-1">{sub}</p></div>)}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
            <section className="bg-white border border-[#e5ded8] rounded-2xl p-6"><h2 className="font-semibold mb-4">Agendamentos de hoje</h2>{hoje.length ? hoje.map(a => <div key={a.id} className="flex items-center justify-between gap-4 py-4 border-b last:border-0 border-[#eee7e2]"><div><p className="text-sm font-semibold">{a.Cliente?.nome}</p><p className="text-xs text-[#a3644f] mt-1">{a.Servico?.nome} · {a.Profissional?.nome}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold">{String(a.horario_inicio).slice(0,5)}</span><span className={`text-[10px] border rounded-full px-2.5 py-1 ${statusColor(a.status)}`}>{a.status}</span></div></div>) : <p className="text-sm text-[#a09692] py-6">Nenhum agendamento para hoje.</p>}</section>
            <section className="bg-white border border-[#e5ded8] rounded-2xl p-6"><h2 className="font-semibold mb-5">Serviços populares</h2>{(servicosPopulares as any[]).length ? (servicosPopulares as any[]).map(x => <div key={x.nome} className="mb-5"><div className="flex justify-between text-xs mb-2"><span>{x.nome}</span><b>{Math.round(x.qtd / maxPopular * 100)}%</b></div><div className="h-2 bg-[#f2ebe6] rounded-full overflow-hidden"><div className="h-full bg-[#a3644f] rounded-full" style={{ width: `${x.qtd / maxPopular * 100}%` }}/></div></div>) : <p className="text-sm text-[#a09692]">Ainda não há dados.</p>}</section>
          </div>
        </div>}
        {tab === 'Agendamentos' && <section className="bg-white border border-[#e5ded8] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#e5ded8] flex flex-wrap gap-3 items-center justify-between"><div className="flex flex-wrap gap-2">{['Todos','Confirmado','Pendente','Concluído','Cancelado','Agendado'].map(s => <button key={s} onClick={() => setFiltroStatus(s)} className={`px-4 py-2 rounded-full text-xs border ${filtroStatus === s ? 'bg-[#a3644f] border-[#a3644f] text-white' : 'border-[#e5ded8] hover:border-[#a3644f]'}`}>{s}</button>)}</div><div className="relative"><Search className="absolute left-3 top-2.5 text-[#a09692]" size={15}/><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar agendamento..." className="border border-[#e5ded8] rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#a3644f]"/></div></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs min-w-[900px]"><thead className="bg-[#faf7f5] text-[#8d817b]"><tr>{['CLIENTE','SERVIÇO','PROFISSIONAL','DATA','HORÁRIO','STATUS','AÇÕES'].map(x => <th className="px-4 py-3 font-medium" key={x}>{x}</th>)}</tr></thead><tbody>{listaAgendamentos.map(a => <tr key={a.id} className="border-t border-[#eee7e2]"><td className="px-4 py-4 font-semibold">{a.Cliente?.nome}</td><td className="px-4 py-4 text-[#8d6556]">{a.Servico?.nome}</td><td className="px-4 py-4 text-[#8d6556]">{a.Profissional?.nome}</td><td className="px-4 py-4">{new Date(`${a.data}T00:00:00`).toLocaleDateString('pt-BR')}</td><td className="px-4 py-4">{String(a.horario_inicio).slice(0,5)}</td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full border text-[10px] ${statusColor(a.status)}`}>{a.status}</span></td><td className="px-4 py-4"><div className="flex flex-wrap gap-2">{(a.status === 'Pendente' || a.status === 'Agendado') && <button onClick={() => atualizarStatus(a.id,'Confirmado')} className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white focus-visible:ring-emerald-300">Confirmar</button>}{a.status !== 'Concluído' && a.status !== 'Cancelado' && <button onClick={() => atualizarStatus(a.id,'Concluído')} className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 border-[#a3644f]/30 bg-[#a3644f]/10 text-[#a3644f] hover:bg-[#a3644f] hover:border-[#a3644f] hover:text-white focus-visible:ring-[#a3644f]/40">Concluir</button>}{a.status !== 'Cancelado' && a.status !== 'Concluído' && <button onClick={() => atualizarStatus(a.id,'Cancelado')} className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:border-rose-600 hover:text-white focus-visible:ring-rose-300">Cancelar</button>}<button onClick={() => { setAgendamentoDetalhe(a); setModal('agendamento'); }} className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 border-[#e5ded8] bg-white text-[#6e635f] hover:bg-[#3a2e2b] hover:border-[#3a2e2b] hover:text-white focus-visible:ring-[#cbbab3]">Ver</button></div></td></tr>)}</tbody></table>{listaAgendamentos.length === 0 && <p className="p-8 text-center text-sm text-[#a09692]">Nenhum agendamento encontrado.</p>}</div>
        </section>}
        {tab === 'Profissionais' && <><div className="flex justify-end mb-4"><button onClick={() => { setProfissionalEditando(null); setForm({ nome: '', email: '', senha: '', especializacao: '' }); setModal('profissional'); }} className="bg-[#a3644f] hover:bg-[#8a4f3d] text-white rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2"><Plus size={15}/> Adicionar profissional</button></div><div className="grid md:grid-cols-2 gap-4">{profissionais.map(p => <div key={p.id} className="bg-white border border-[#e5ded8] rounded-2xl p-5"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-[#f2e9e4] text-[#a3644f] flex items-center justify-center font-semibold">{initials(p.nome)}</div><div className="flex-1"><h3 className="font-semibold text-sm">{p.nome}</h3><p className="text-xs text-[#a3644f]">{p.especializacao || 'Profissional'}</p></div><span className="text-[10px] rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">Ativo</span></div><p className="text-xs text-[#8d817b] mt-4">{p.email || 'E-mail não cadastrado'}</p><p className="text-xs mt-2">{agendamentos.filter(a => a.profissional_id === p.id).length} agendamentos registrados</p><div className="mt-4 pt-3 border-t border-[#eee7e2] flex justify-end"><button onClick={() => { setProfissionalEditando(p); setForm({ nome: p.nome || '', email: p.email || '', senha: '', especializacao: p.especializacao || '' }); setModal('profissional'); }} className="text-xs font-semibold text-[#a3644f]">Editar</button></div></div>)}</div></>}
        {tab === 'Disponibilidade' && <div className="grid xl:grid-cols-[2fr_1fr] gap-5"><section className="bg-white border border-[#e5ded8] rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3 mb-5"><div>{usuario.tipo === 'admin' ? <select value={profissionalSelecionado} onChange={e => setProfissionalSelecionado(e.target.value)} className="border border-[#e5ded8] rounded-xl px-3 py-2 text-sm"><option value="">Selecione um profissional</option>{profissionais.map(p => <option value={p.id} key={p.id}>{p.nome}</option>)}</select> : <p className="font-semibold">{usuario.nome}</p>}<p className="text-xs text-[#a09692] mt-2">Selecione uma data para consultar os horários</p></div><div className="flex flex-wrap gap-2"><input type="date" value={dataSelecionada} onChange={e => setDataSelecionada(e.target.value)} className="border border-[#e5ded8] rounded-xl p-2 text-sm"/>{new Date(`${dataSelecionada}T12:00:00`).getDay() === 0 && <button disabled={usuario.tipo === 'admin' && !profissionalSelecionado} onClick={liberarDomingo} className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs">Liberar este domingo</button>}</div></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{slots.map(h => {const ocupado = agendamentos.some(a => a.profissional_id === Number(profissionalSelecionado || usuario.id) && String(a.data).slice(0,10) === dataSelecionada && a.status !== 'Cancelado' && String(a.horario_inicio).slice(0,5) === h); const domingoSemLiberacao = new Date(`${dataSelecionada}T12:00:00`).getDay() === 0 && !profissionaisDomingoLiberado.includes(Number(profissionalSelecionado || usuario.id)); const bloqueado = domingoSemLiberacao || bloqueios.some(b => b.profissional_id === Number(profissionalSelecionado || usuario.id) && String(b.data).slice(0,10) === dataSelecionada && String(b.horario_inicio).slice(0,5) <= h && String(b.horario_fim).slice(0,5) > h); return <div key={h} className={`rounded-lg border p-3 text-center text-xs ${bloqueado ? 'bg-rose-50 border-rose-200 text-rose-700' : ocupado ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{h}<div className="text-[10px] mt-1">{bloqueado ? 'Bloqueado' : ocupado ? 'Agendado' : 'Disponível'}</div></div>; })}</div><div className="flex gap-4 text-[11px] mt-6 border-t border-[#eee7e2] pt-4"><span className="text-emerald-700">● Disponível</span><span className="text-amber-700">● Agendado</span><span className="text-rose-700">● Bloqueado</span></div></section><section className="bg-white border border-[#e5ded8] rounded-2xl p-5"><div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Horários bloqueados</h3><button onClick={() => setModal('bloqueio')} className="text-xs bg-[#a3644f] text-white rounded-lg px-3 py-2"><Plus size={13} className="inline"/> Bloquear</button></div>{bloqueios.filter(b => usuario.tipo === 'profissional' ? b.profissional_id === usuario.id : !profissionalSelecionado || b.profissional_id === Number(profissionalSelecionado)).map(b => <div key={b.id} className="p-3 rounded-xl bg-rose-50 border border-rose-200 mb-2 flex justify-between items-center"><div className="text-xs text-rose-700"><b>{String(b.horario_inicio).slice(0,5)} – {String(b.horario_fim).slice(0,5)}</b><p>{new Date(`${b.data}T00:00:00`).toLocaleDateString('pt-BR')}</p></div><button onClick={() => removerBloqueio(b.id)} className="text-rose-600"><X size={16}/></button></div>)}{bloqueios.length === 0 && <p className="text-xs text-[#a09692]">Nenhum bloqueio ativo.</p>}</section></div>}
        {tab === 'Relatórios' && <div className="space-y-5"><section className="bg-white border border-[#e5ded8] rounded-2xl p-5"><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"><label className="text-xs text-[#8d817b]">Data inicial<input type="date" value={dataInicial} onChange={e => setDataInicial(e.target.value)} className="mt-2 w-full border border-[#e5ded8] rounded-xl p-2.5 text-sm text-[#3a2e2b]"/></label><label className="text-xs text-[#8d817b]">Data final<input type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} className="mt-2 w-full border border-[#e5ded8] rounded-xl p-2.5 text-sm text-[#3a2e2b]"/></label>{usuario.tipo === 'admin' && <label className="text-xs text-[#8d817b]">Profissional<select value={filtroProfissional} onChange={e => setFiltroProfissional(e.target.value)} className="mt-2 w-full border border-[#e5ded8] rounded-xl p-2.5 text-sm text-[#3a2e2b]"><option value="">Todos</option>{profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>}<button onClick={exportar} className="bg-[#a3644f] hover:bg-[#8a4f3d] text-white rounded-xl p-3 text-xs font-semibold flex items-center justify-center gap-2"><Download size={15}/> Exportar Excel (.xlsx)</button></div></section><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[['Total de agendamentos',resumo.totalAgendamentos || 0],['Atendimentos concluídos',resumo.concluidos || 0],['Ticket médio',money(resumo.ticketMedio || 0)],['Faturamento',money(resumo.faturamento || 0)]].map(([t,v]) => <div key={String(t)} className="bg-white border border-[#e5ded8] rounded-2xl p-5"><p className="text-xs text-[#8d817b]">{t}</p><p className="font-serif text-2xl font-semibold mt-3">{v}</p></div>)}</div><section className="bg-white border border-[#e5ded8] rounded-2xl p-5"><h3 className="font-semibold mb-4">Atendimentos do período</h3><div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="text-[#8d817b]"><tr>{['DATA','CLIENTE','SERVIÇO','PROFISSIONAL','STATUS','VALOR'].map(x => <th className="py-3 pr-3" key={x}>{x}</th>)}</tr></thead><tbody>{agendamentos.filter(a => a.data >= dataInicial && a.data <= dataFinal && (usuario.tipo === 'profissional' ? a.profissional_id === usuario.id : !filtroProfissional || a.profissional_id === Number(filtroProfissional))).map(a => <tr key={a.id} className="border-t border-[#eee7e2]"><td className="py-3 pr-3">{new Date(`${a.data}T00:00:00`).toLocaleDateString('pt-BR')}</td><td className="py-3 pr-3">{a.Cliente?.nome}</td><td className="py-3 pr-3">{a.Servico?.nome}</td><td className="py-3 pr-3">{a.Profissional?.nome}</td><td className="py-3 pr-3">{a.status}</td><td className="py-3 pr-3">{money(Number(a.Servico?.preco || 0))}</td></tr>)}</tbody></table></div></section><p className="text-[11px] text-[#a09692]">O faturamento considera apenas atendimentos com status Concluído. O lucro não é calculado porque o banco atual não possui custos/despesas cadastrados.</p></div>}
        {tab === 'Clientes' && <section className="bg-white border border-[#e5ded8] rounded-2xl overflow-hidden"><div className="p-4 border-b border-[#e5ded8]"><div className="relative"><Search className="absolute left-3 top-2.5 text-[#a09692]" size={15}/><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone..." className="w-full border border-[#e5ded8] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-[#a3644f]"/></div></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-xs text-left"><thead className="bg-[#faf7f5] text-[#8d817b]"><tr>{['NOME','E-MAIL','TELEFONE','AGENDAMENTOS','CLIENTE DESDE','AÇÕES'].map(x => <th key={x} className="px-4 py-3 font-medium">{x}</th>)}</tr></thead><tbody>{clientes.filter(c => `${c.nome} ${c.email} ${c.telefone}`.toLowerCase().includes(busca.toLowerCase())).map(c => <tr key={c.id} className="border-t border-[#eee7e2]"><td className="px-4 py-4"><span className="inline-flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-[#f2e9e4] text-[#a3644f] flex items-center justify-center font-semibold">{initials(c.nome)}</span><b>{c.nome}</b></span></td><td className="px-4 py-4 text-[#8d6556]">{c.email}</td><td className="px-4 py-4 text-[#8d6556]">{c.telefone || '—'}</td><td className="px-4 py-4">{agendamentos.filter(a => a.cliente_id === c.id).length}</td><td className="px-4 py-4">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}) : '—'}</td><td className="px-4 py-4"><button onClick={() => { setClienteDetalhe(c); setModal('cliente'); }} className="text-[#a3644f]">Ver detalhes</button></td></tr>)}</tbody></table></div></section>}
        </>}
      </div>
    </main>
    {modal && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative"><button onClick={() => setModal(null)} className="absolute top-4 right-4 text-[#a09692]"><X size={18}/></button>
      {modal === 'bloqueio' && <form onSubmit={criarBloqueio} className="space-y-4"><h2 className="font-serif text-2xl">Bloquear horário</h2>{usuario.tipo === 'admin' && <label className="block text-xs">Profissional<select required value={profissionalSelecionado} onChange={e => setProfissionalSelecionado(e.target.value)} className="w-full mt-1 p-2 border rounded-lg"><option value="">Selecione</option>{profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>}<label className="block text-xs">Data<input required type="date" value={form.data} onChange={e => setForm({...form,data:e.target.value})} className="w-full mt-1 p-2 border rounded-lg"/></label><div className="grid grid-cols-2 gap-3"><label className="text-xs">Início<input required type="time" value={form.inicio} onChange={e => setForm({...form,inicio:e.target.value})} className="w-full mt-1 p-2 border rounded-lg"/></label><label className="text-xs">Fim<input required type="time" value={form.fim} onChange={e => setForm({...form,fim:e.target.value})} className="w-full mt-1 p-2 border rounded-lg"/></label></div><label className="block text-xs">Motivo<input value={form.motivo} onChange={e => setForm({...form,motivo:e.target.value})} className="w-full mt-1 p-2 border rounded-lg"/></label><button className="w-full bg-[#a3644f] text-white rounded-xl py-3 text-sm">Salvar bloqueio</button></form>}
      {modal === 'profissional' && <form onSubmit={salvarProfissional} className="space-y-4"><h2 className="font-serif text-2xl">{profissionalEditando ? 'Editar profissional' : 'Adicionar profissional'}</h2>{[['nome','Nome completo'],['email','E-mail de acesso'],['senha',profissionalEditando ? 'Nova senha (opcional)' : 'Senha inicial'],['especializacao','Especialidade']].map(([key,label]) => <label className="block text-xs" key={key}>{label}<input required={key !== 'especializacao' && key !== 'senha' && !profissionalEditando} type={key === 'senha' ? 'password' : 'text'} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="w-full mt-1 p-2.5 border border-[#e5ded8] rounded-lg"/></label>)}<button className="w-full bg-[#a3644f] text-white rounded-xl py-3 text-sm">{profissionalEditando ? 'Salvar alterações' : 'Cadastrar'}</button></form>}
      {modal === 'agendamento' && agendamentoDetalhe && <><h2 className="font-serif text-2xl mb-4">Detalhes do agendamento</h2><div className="space-y-3 text-sm"><p><span className="text-[#a09692]">Cliente:</span> {agendamentoDetalhe.Cliente?.nome}</p><p><span className="text-[#a09692]">Serviço:</span> {agendamentoDetalhe.Servico?.nome}</p><p><span className="text-[#a09692]">Profissional:</span> {agendamentoDetalhe.Profissional?.nome}</p><p><span className="text-[#a09692]">Data:</span> {new Date(`${agendamentoDetalhe.data}T00:00:00`).toLocaleDateString('pt-BR')}</p><p><span className="text-[#a09692]">Horário:</span> {String(agendamentoDetalhe.horario_inicio).slice(0,5)} – {String(agendamentoDetalhe.horario_fim).slice(0,5)}</p><p><span className="text-[#a09692]">Status:</span> {agendamentoDetalhe.status}</p><p><span className="text-[#a09692]">Valor:</span> {money(Number(agendamentoDetalhe.Servico?.preco || 0))}</p></div></>}
      {modal === 'cliente' && clienteDetalhe && <><h2 className="font-serif text-2xl mb-1">{clienteDetalhe.nome}</h2><p className="text-xs text-[#a09692] mb-5">{clienteDetalhe.email} · {clienteDetalhe.telefone}</p><h3 className="font-semibold text-sm mb-2">Histórico de agendamentos</h3>{agendamentos.filter(a => a.cliente_id === clienteDetalhe.id).map(a => <div key={a.id} className="py-3 border-t border-[#eee7e2] text-xs"><b>{a.Servico?.nome}</b><p className="text-[#8d817b]">{new Date(`${a.data}T00:00:00`).toLocaleDateString('pt-BR')} · {a.status} · {a.Profissional?.nome}</p></div>)}</>}
    </div></div>}
  </div>;
}