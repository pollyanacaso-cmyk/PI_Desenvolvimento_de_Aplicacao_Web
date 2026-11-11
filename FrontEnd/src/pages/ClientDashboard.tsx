import React, { useState, useEffect } from 'react';

export interface ClientDashboardProps {
  onNavigateHome?: () => void;
  onNavigateBooking?: () => void;
  onLogout?: () => void;
}

export default function ClientDashboard({
  onNavigateHome,
  onNavigateBooking,
  onLogout
}: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'painel' | 'agendamentos' | 'historico' | 'perfil'>('painel');
  const [usuario, setUsuario] = useState<any>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const userStored = localStorage.getItem('ke_bella_user');
    if (userStored) {
      const parsedUser = JSON.parse(userStored);
      setUsuario(parsedUser);

      // Busca os agendamentos reais do cliente na API do MySQL
      const fetchMeusAgendamentos = async () => {
        setLoading(true);
        try {
          const clienteId = parsedUser.id || parsedUser.cliente_id;
          const response = await fetch(`http://localhost:3000/agendamentos?cliente_id=${clienteId}`);
          if (response.ok) {
            const data = await response.json();
            setAgendamentos(data);
          }
        } catch (err) {
          console.error('Erro ao carregar agendamentos:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchMeusAgendamentos();
    }
  }, []);

  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Cliente';
  const iniciais = usuario?.nome 
    ? usuario.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
    : 'CL';

  // Filtra agendamentos
  const proximoAgendamento = agendamentos.find(a => a.status !== 'Cancelado');
  const agendamentosFuturos = agendamentos.filter(a => a.status !== 'Cancelado').length;
  const atendimentosRealizados = agendamentos.filter(a => a.status === 'Concluído').length;

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col md:flex-row">
      {/* Sidebar Esquerda (Navegação da Área do Cliente) */}
      <aside className="w-full md:w-64 border-r border-[#f0ece9] bg-white p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logotipo */}
          <div className="mb-8">
            <button 
              onClick={onNavigateHome}
              className="font-serif italic text-2xl font-semibold text-[#3a2e2b] text-left cursor-pointer"
            >
              Ke Bella
            </button>
            <p className="text-xs text-[#a09692] font-serif italic mt-0.5">Área do cliente</p>
          </div>

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

            <button
              onClick={() => setActiveTab('historico')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'historico' 
                  ? 'bg-[#a3644f] text-white shadow-sm' 
                  : 'text-[#a09692] hover:bg-[#f8f5f2] hover:text-[#3a2e2b]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Histórico
            </button>

            <button
              onClick={() => setActiveTab('perfil')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'perfil' 
                  ? 'bg-[#a3644f] text-white shadow-sm' 
                  : 'text-[#a09692] hover:bg-[#f8f5f2] hover:text-[#3a2e2b]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Perfil
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

      {/* Conteúdo Principal do Painel */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#3a2e2b]">Olá, {primeiroNome}!</h1>
          <p className="text-[#a09692] text-sm mt-1">Bem-vinda ao seu painel. Veja seus próximos agendamentos.</p>
        </div>

        {/* Card Destaque (Próximo Agendamento) */}
        {proximoAgendamento ? (
          <div className="bg-[#a3644f] text-white rounded-3xl p-6 md:p-8 mb-8 shadow-md">
            <span className="text-xs uppercase tracking-wider text-white/80 font-semibold mb-4 block">
              Próximo agendamento
            </span>
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
                <p className="font-semibold text-lg">{proximoAgendamento.data}</p>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Horário</p>
                <p className="font-semibold text-lg">{proximoAgendamento.horario_inicio?.substring(0, 5)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20 flex flex-wrap justify-between items-center gap-4">
              <span className="text-sm font-medium">
                Valor: <strong>R$ {Number(proximoAgendamento.Servico?.preco || 85).toFixed(2).replace('.', ',')}</strong>
              </span>
              <span className="bg-white/20 text-white text-xs px-4 py-1.5 rounded-full font-semibold">
                {proximoAgendamento.status || 'Confirmado'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#f0ece9] rounded-3xl p-8 mb-8 text-center shadow-sm">
            <p className="text-[#a09692] text-sm mb-4">Você ainda não tem próximos agendamentos.</p>
            <button
              onClick={onNavigateBooking}
              className="bg-[#a3644f] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#8a4f3d] transition-all cursor-pointer"
            >
              Agendar agora
            </button>
          </div>
        )}

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#f0ece9] rounded-2xl p-6 text-center shadow-sm">
            <span className="font-serif text-4xl font-semibold text-[#3a2e2b] block mb-1">
              {agendamentosFuturos}
            </span>
            <p className="font-semibold text-xs text-[#3a2e2b]">Agendamentos</p>
            <p className="text-[11px] text-[#a09692]">futuros</p>
          </div>

          <div className="bg-white border border-[#f0ece9] rounded-2xl p-6 text-center shadow-sm">
            <span className="font-serif text-4xl font-semibold text-[#3a2e2b] block mb-1">
              {atendimentosRealizados}
            </span>
            <p className="font-semibold text-xs text-[#3a2e2b]">Atendimentos</p>
            <p className="text-[11px] text-[#a09692]">realizados</p>
          </div>

          <div className="bg-white border border-[#f0ece9] rounded-2xl p-6 text-center shadow-sm">
            <span className="font-serif text-4xl font-semibold text-[#3a2e2b] block mb-1">
              1
            </span>
            <p className="font-semibold text-xs text-[#3a2e2b]">Próximo em</p>
            <p className="text-[11px] text-[#a09692]">dias</p>
          </div>
        </div>

        {/* Lista de Próximos Agendamentos */}
        <div>
          <h2 className="font-semibold text-lg text-[#3a2e2b] mb-4">Próximos agendamentos</h2>

          {loading ? (
            <p className="text-xs text-[#a09692]">Carregando agendamentos...</p>
          ) : agendamentos.length === 0 ? (
            <p className="text-xs text-[#a09692]">Nenhum agendamento encontrado.</p>
          ) : (
            <div className="space-y-3">
              {agendamentos.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-[#f0ece9] rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#3a2e2b]">{item.Servico?.nome || 'Serviço'}</h3>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        {item.status || 'Confirmado'}
                      </span>
                    </div>
                    <p className="text-xs text-[#a09692] mb-1">
                      com {item.Profissional?.nome || 'Profissional'}
                    </p>
                    <p className="text-xs text-[#a09692]">
                      {item.data} às {item.horario_inicio?.substring(0, 5)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#f0ece9]">
                    <span className="font-semibold text-[#a3644f] text-sm">
                      R$ {Number(item.Servico?.preco || 0).toFixed(2).replace('.', ',')}
                    </span>
                    <button className="border border-rose-200 text-rose-500 text-xs px-4 py-2 rounded-xl font-medium hover:bg-rose-50 transition-colors cursor-pointer">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}