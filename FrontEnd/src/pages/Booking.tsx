import React, { useState, useEffect } from 'react';

export interface Service {
  id: number;
  nome: string;
  categoria?: string;
  duracao_minutos?: number;
  duracao?: string;
  preco: number | string;
  descricao?: string;
}

export interface Professional {
  id: number;
  nome: string;
  especializacao?: string;
  especialidade?: string;
  descricao?: string;
  foto?: string;
  avaliacao?: number;
  atendimentos?: number;
}

export interface BookingProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateMyAppointments?: () => void;
  onBookingSuccess?: () => void;
  initialServiceId?: number | null;
}

type Step = 'service' | 'professional' | 'date' | 'time' | 'confirm' | 'success';

const TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const BLOCKED_TIMES = ['10:00', '15:00'];

const STEP_LABELS: Step[] = ['service', 'professional', 'date', 'time', 'confirm'];
const STEP_NAMES = ['Serviço', 'Profissional', 'Data', 'Horário', 'Confirmar'];

// Obtém o dia atual no fuso horário de Brasília
function getBrasiliaToday() {
  const now = new Date();
  const brasiliaDateStr = now.toLocaleDateString('en-US', { timeZone: 'America/Sao_Paulo' });
  const brasiliaDate = new Date(brasiliaDateStr);
  brasiliaDate.setHours(0, 0, 0, 0);
  return brasiliaDate;
}

function generateCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export default function Booking({
  onNavigateHome,
  onNavigateLogin,
  onNavigateMyAppointments,
  onBookingSuccess,
  initialServiceId
}: BookingProps) {
  const [step, setStep] = useState<Step>('service');
  
  const [servicos, setServicos] = useState<Service[]>([]);
  const [profissionais, setProfissionais] = useState<Professional[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [loadingServicos, setLoadingServicos] = useState<boolean>(false);
  const [loadingProfissionais, setLoadingProfissionais] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const todayDate = getBrasiliaToday();
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const todayDay = todayDate.getDate();

  const monthName = todayDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const calDays = generateCalendar(year, month);

  useEffect(() => {
    const fetchServicos = async () => {
      setLoadingServicos(true);
      try {
        const response = await fetch('http://localhost:3000/servicos');
        if (response.ok) {
          const data = await response.json();
          setServicos(data);

          if (initialServiceId) {
            const encontrado = data.find((s: Service) => Number(s.id) === Number(initialServiceId));
            if (encontrado) {
              setSelectedService(encontrado);
              setStep('professional');
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar serviços:', err);
      } finally {
        setLoadingServicos(false);
      }
    };

    fetchServicos();
  }, [initialServiceId]);

  useEffect(() => {
    const fetchProfissionais = async () => {
      setLoadingProfissionais(true);
      try {
        const response = await fetch('http://localhost:3000/profissionais');
        if (response.ok) {
          const data = await response.json();
          setProfissionais(data);
        }
      } catch (err) {
        console.error('Erro ao buscar profissionais:', err);
      } finally {
        setLoadingProfissionais(false);
      }
    };

    fetchProfissionais();
  }, []);

  const stepIndex = STEP_LABELS.indexOf(step);

  const goNext = () => {
    const next: Record<Step, Step> = {
      service: 'professional',
      professional: 'date',
      date: 'time',
      time: 'confirm',
      confirm: 'success',
      success: 'success'
    };
    setStep(next[step]);
  };

  const goBack = () => {
    const prev: Partial<Record<Step, Step>> = {
      professional: 'service',
      date: 'professional',
      time: 'date',
      confirm: 'time'
    };
    if (prev[step]) setStep(prev[step]!);
  };

  const handleConfirmBooking = async () => {
    setErrorMessage('');

    const userStored = localStorage.getItem('ke_bella_user');
    if (!userStored) {
      if (window.confirm('Você precisa estar logado para agendar. Deseja ir para a tela de login?')) {
        if (onNavigateLogin) onNavigateLogin();
      }
      return;
    }

    const usuario = JSON.parse(userStored);
    const clienteId = usuario.id || usuario.cliente_id;

    if (!clienteId) {
      setErrorMessage('Sessão inválida. Por favor, faça login novamente.');
      return;
    }

    setIsSubmitting(true);

    const formattedDate = selectedDay
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
      : '';

    const horaInicioFormatted = selectedTime
      ? (selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime)
      : '09:00:00';

    const duracao = selectedService?.duracao_minutos || 30;
    const [h, m] = horaInicioFormatted.split(':').map(Number);
    const dateFim = new Date();
    dateFim.setHours(h, m + duracao, 0);

    const horaFimStr = String(dateFim.getHours()).padStart(2, '0');
    const minFimStr = String(dateFim.getMinutes()).padStart(2, '0');
    const horaFimFormatted = `${horaFimStr}:${minFimStr}:00`;

    try {
      const response = await fetch('http://localhost:3000/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ke_bella_token') || ''}`
        },
        body: JSON.stringify({
          cliente_id: Number(clienteId),
          servico_id: Number(selectedService?.id),
          profissional_id: Number(selectedPro?.id),
          data: formattedDate,
          horario_inicio: horaInicioFormatted,
          horario_fim: horaFimFormatted,
          status: 'Agendado',
          observacoes: selectedPro ? `Profissional: ${selectedPro.nome}` : ''
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detalhe = data.erros && data.erros.length > 0 ? ` (${data.erros.join(', ')})` : '';
        throw new Error((data.mensagem || 'Não foi possível realizar o agendamento.') + detalhe);
      }

      // Avança para a tela verde de confirmação
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar o agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToMyAppointments = () => {
    if (onBookingSuccess) onBookingSuccess();
    if (onNavigateMyAppointments) {
      onNavigateMyAppointments();
    }
  };

  // TELA DE AGENDAMENTO CONFIRMADO
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-3 text-[#3a2e2b]">Agendamento confirmado!</h1>
          <p className="text-[#a09692] text-sm mb-8">Você receberá uma confirmação por WhatsApp em breve.</p>

          <div className="bg-white border border-[#f0ece9] rounded-2xl p-6 mb-8 text-left space-y-3 shadow-sm">
            <Row label="Serviço" value={selectedService?.nome ?? '—'} />
            <Row label="Profissional" value={selectedPro?.nome ?? '—'} />
            <Row label="Data" value={selectedDay ? `${String(selectedDay).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}` : '—'} />
            <Row label="Horário" value={selectedTime ?? '—'} />
            <Row label="Valor" value={selectedService ? `R$ ${Number(selectedService.preco).toFixed(2).replace('.', ',')}` : '—'} />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToMyAppointments}
              className="w-full bg-[#a3644f] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] transition-all cursor-pointer shadow-sm"
            >
              Ver meus agendamentos
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full text-[#a09692] hover:text-[#3a2e2b] py-2 text-sm font-medium transition-colors cursor-pointer"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <div className="border-b border-[#f0ece9] bg-white py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="font-serif italic text-xl font-semibold text-[#3a2e2b] cursor-pointer"
          >
            Ke Bella
          </button>
          <button onClick={onNavigateHome} className="text-sm text-[#a09692] hover:text-[#3a2e2b] transition-colors cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>

      <div className="border-b border-[#f0ece9] bg-[#f8f5f2] py-4 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {STEP_LABELS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < stepIndex ? 'bg-[#a3644f] text-white' :
                  i === stepIndex ? 'bg-[#a3644f] text-white ring-4 ring-[#a3644f]/20' :
                  'bg-[#e5ded8] text-[#a09692]'
                }`}>
                  {i < stepIndex ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? 'text-[#3a2e2b]' : 'text-[#a09692]'}`}>
                  {STEP_NAMES[i]}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-px w-6 sm:w-12 transition-colors ${i < stepIndex ? 'bg-[#a3644f]' : 'bg-[#e5ded8]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* PASSO 1: SERVIÇO */}
        {step === 'service' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Escolha o serviço</h2>
            <p className="text-[#a09692] text-sm mb-8">Selecione o serviço que deseja agendar</p>
            
            {loadingServicos ? (
              <p className="text-xs text-[#a09692] py-8">Carregando catálogo de serviços...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {servicos.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setSelectedPro(null); }}
                    className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedService?.id === svc.id ? 'border-[#a3644f] bg-[#f8f5f2]' : 'border-[#e5ded8] bg-white hover:border-[#a3644f]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs text-[#a09692] uppercase tracking-wide">{svc.categoria || 'Geral'}</span>
                      {selectedService?.id === svc.id && (
                        <div className="w-5 h-5 rounded-full bg-[#a3644f] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#3a2e2b] mb-1">{svc.nome}</h3>
                    <p className="text-sm text-[#a09692] mb-3 line-clamp-1">{svc.descricao}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a09692]">{svc.duracao_minutos || svc.duracao || '30'} min</span>
                      <span className="font-semibold text-[#a3644f]">R$ {Number(svc.preco).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={goNext}
                disabled={!selectedService}
                className="bg-[#a3644f] text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: PROFISSIONAL */}
        {step === 'professional' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Escolha a profissional</h2>
            <p className="text-[#a09692] text-sm mb-8">
              Profissionais disponíveis para <strong>{selectedService?.nome}</strong>
            </p>

            {loadingProfissionais ? (
              <p className="text-xs text-[#a09692] py-8">Carregando profissionais...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {profissionais.map((pro) => (
                  <button
                    key={pro.id}
                    type="button"
                    onClick={() => setSelectedPro(pro)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                      selectedPro?.id === pro.id ? 'border-[#a3644f] bg-[#f8f5f2]' : 'border-[#e5ded8] bg-white hover:border-[#a3644f]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#a3644f]/10 text-[#a3644f] font-bold text-lg flex items-center justify-center shrink-0">
                      {pro.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-[#3a2e2b] text-sm truncate">{pro.nome}</h3>
                        {selectedPro?.id === pro.id && (
                          <div className="w-5 h-5 rounded-full bg-[#a3644f] flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-[#a3644f] text-xs font-medium mt-0.5 mb-1">{pro.especializacao || pro.especialidade}</p>
                      <p className="text-xs text-[#a09692] line-clamp-1">{pro.descricao}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] transition-colors cursor-pointer">
                Voltar
              </button>
              <button
                onClick={goNext}
                disabled={!selectedPro}
                className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: DATA */}
        {step === 'date' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Escolha a data</h2>
            <p className="text-[#a09692] text-sm mb-8">Selecione o dia de sua preferência (agendamentos disponíveis a partir de amanhã)</p>

            <div className="bg-white border border-[#e5ded8] rounded-2xl p-6 mb-8 max-w-sm">
              <h3 className="font-semibold text-center mb-4 text-[#3a2e2b] capitalize">{monthName}</h3>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="text-center text-xs text-[#a09692] font-medium py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  
                  const isPastOrToday = day <= todayDay;
                  const isToday = day === todayDay;
                  const isSelected = day === selectedDay;

                  return (
                    <button
                      key={day}
                      disabled={isPastOrToday}
                      onClick={() => setSelectedDay(day)}
                      className={`h-9 rounded-lg text-sm transition-all cursor-pointer ${
                        isSelected ? 'bg-[#a3644f] text-white font-semibold' :
                        isToday ? 'border border-[#a3644f] text-[#a3644f] bg-rose-50/50 cursor-not-allowed' :
                        isPastOrToday ? 'text-[#a09692]/40 bg-zinc-50 cursor-not-allowed line-through' :
                        'hover:bg-[#f8f5f2] text-[#3a2e2b]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8 text-xs text-[#a09692]">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#a3644f]"></div> Selecionado</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-[#a3644f]"></div> Hoje (Indisponível)</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-zinc-100 border border-zinc-200"></div> Bloqueado</div>
            </div>

            <div className="flex gap-3 justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] transition-colors cursor-pointer">
                Voltar
              </button>
              <button onClick={goNext} disabled={!selectedDay}
                className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 4: HORÁRIO */}
        {step === 'time' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Escolha o horário</h2>
            <p className="text-[#a09692] text-sm mb-8">
              Horários disponíveis para {selectedDay}/{String(month + 1).padStart(2, '0')}/{year} com {selectedPro?.nome}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
              {TIMES.map(time => {
                const blocked = BLOCKED_TIMES.includes(time);
                const selected = time === selectedTime;
                return (
                  <button
                    key={time}
                    disabled={blocked}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      selected ? 'bg-[#a3644f] text-white' :
                      blocked ? 'bg-zinc-100 text-[#a09692]/40 cursor-not-allowed line-through' :
                      'border border-[#e5ded8] bg-white hover:border-[#a3644f] hover:text-[#a3644f]'
                    }`}
                  >
                    {time}
                    {blocked && <div className="text-[10px] mt-0.5 normal-case font-normal">Ocupado</div>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] transition-colors cursor-pointer">
                Voltar
              </button>
              <button onClick={goNext} disabled={!selectedTime}
                className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 5: CONFIRMAR AGENDAMENTO */}
        {step === 'confirm' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Confirmar agendamento</h2>
            <p className="text-[#a09692] text-sm mb-8">Revise os detalhes antes de confirmar</p>

            <div className="bg-white border border-[#e5ded8] rounded-2xl p-6 mb-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-4 pb-4 border-b border-[#f0ece9]">
                <div className="w-14 h-14 rounded-xl bg-[#a3644f]/10 text-[#a3644f] font-bold text-xl flex items-center justify-center shrink-0">
                  {selectedPro?.nome ? selectedPro.nome.charAt(0) : 'P'}
                </div>
                <div>
                  <h3 className="font-semibold text-[#3a2e2b]">{selectedPro?.nome}</h3>
                  <p className="text-sm text-[#a3644f]">{selectedPro?.especializacao || selectedPro?.especialidade}</p>
                </div>
              </div>
              
              <Row label="Serviço" value={selectedService?.nome ?? '—'} />
              <Row label="Data" value={selectedDay ? `${String(selectedDay).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}` : '—'} />
              <Row label="Horário" value={selectedTime ?? '—'} />
              <Row label="Duração" value={`${selectedService?.duracao_minutos || selectedService?.duracao || 30} minutos`} />
              
              <div className="pt-3 border-t border-[#f0ece9]">
                <Row label="Total" value={`R$ ${selectedService ? Number(selectedService.preco).toFixed(2).replace('.', ',') : '—'}`} bold />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
              <strong>Lembrete:</strong> Cancelamentos devem ser feitos com no mínimo 24h de antecedência.
            </div>

            <div className="flex gap-3 justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] transition-colors cursor-pointer">
                Voltar
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#a09692]">{label}</span>
      <span className={bold ? 'font-bold text-[#a3644f] text-base' : 'font-medium text-[#3a2e2b]'}>{value}</span>
    </div>
  );
}