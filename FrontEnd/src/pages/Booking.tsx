import React, { useState, useEffect } from 'react';

export interface Service {
  id: number;
  nome: string;
  categoria?: string;
  grupo?: string;
  variacao?: string;
  duracao_minutos?: number;
  preco: number | string;
  descricao?: string;
}

export interface Professional {
  id: number;
  nome: string;
  especializacao?: string;
  descricao?: string;
}

export interface BookingProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateMyAppointments?: () => void;
  onBookingSuccess?: () => void;
  initialServiceId?: number | string | null;
  initialGroupName?: string | null;
}

type Step = 'service' | 'professional' | 'date' | 'time' | 'confirm' | 'success';

// CATÁLOGO COMPLETO DOS 35 SERVIÇOS DO BANCO DE DADOS
const MOCK_SERVICOS: Service[] = [
  // CORTES & PENTEADOS
  { id: 1, nome: "Corte feminino com escova ou chapinha", grupo: "Corte", variacao: "Feminino (Escova ou Chapinha)", categoria: "Cabelo", duracao_minutos: 30, preco: 60.00, descricao: "Corte feminino com escova ou chapinha." },
  { id: 2, nome: "Corte feminino com escova e chapinha", grupo: "Corte", variacao: "Feminino (Escova e Chapinha)", categoria: "Cabelo", duracao_minutos: 30, preco: 75.00, descricao: "Corte feminino com escova e chapinha." },
  { id: 3, nome: "Corte masculino", grupo: "Corte", variacao: "Masculino", categoria: "Cabelo", duracao_minutos: 30, preco: 35.00, descricao: "Corte de cabelo masculino." },
  { id: 21, nome: "Penteado", grupo: "Finalizacao", variacao: "Penteado Social", categoria: "Cabelo", duracao_minutos: 50, preco: 100.00, descricao: "Serviço de penteado social." },

  // FINALIZAÇÃO & HIDRATAÇÃO
  { id: 4, nome: "Escova ou chapinha", grupo: "Finalizacao", variacao: "Escova ou Chapinha", categoria: "Cabelo", duracao_minutos: 30, preco: 60.00, descricao: "Finalização com escova ou chapinha." },
  { id: 5, nome: "Escova e chapinha", grupo: "Finalizacao", variacao: "Escova e Chapinha", categoria: "Cabelo", duracao_minutos: 30, preco: 75.00, descricao: "Finalização com escova e chapinha." },
  { id: 22, nome: "Hidratação com escova ou chapinha", grupo: "Hidratacao", variacao: "Com Escova ou Chapinha", categoria: "Tratamentos", duracao_minutos: 30, preco: 80.00, descricao: "Hidratação com escova ou chapinha." },
  { id: 23, nome: "Hidratação com escova e chapinha", grupo: "Hidratacao", variacao: "Com Escova e Chapinha", categoria: "Tratamentos", duracao_minutos: 30, preco: 95.00, descricao: "Hidratação com escova e chapinha." },
  { id: 24, nome: "Pacote de hidratação - 4 sessões", grupo: "Hidratacao", variacao: "Pacote 4 Sessões", categoria: "Tratamentos", duracao_minutos: 30, preco: 270.00, descricao: "Pacote com quatro sessões de hidratação." },

  // COLORAÇÃO
  { id: 6, nome: "Coloração - retoque de raiz", grupo: "Coloracao", variacao: "Retoque de Raiz", categoria: "Coloração", duracao_minutos: 40, preco: 70.00, descricao: "Coloração profissional para retoque da raiz." },
  { id: 7, nome: "Coloração - cabelo todo", grupo: "Coloracao", variacao: "Cabelo Todo", categoria: "Coloração", duracao_minutos: 40, preco: 97.00, descricao: "Coloração profissional em todo o cabelo." },
  { id: 8, nome: "Aplicação de coloração com escova ou chapinha", grupo: "Coloracao", variacao: "Aplicação (Escova ou Chapinha)", categoria: "Coloração", duracao_minutos: 40, preco: 60.00, descricao: "Aplicação de coloração com escova ou chapinha." },
  { id: 9, nome: "Aplicação de coloração com escova e chapinha", grupo: "Coloracao", variacao: "Aplicação (Escova e Chapinha)", categoria: "Coloração", duracao_minutos: 40, preco: 75.00, descricao: "Aplicação de coloração com escova e chapinha." },

  // PROGRESSIVA
  { id: 10, nome: "Progressiva - cabelo curto", grupo: "Progressiva", variacao: "Cabelo Curto", categoria: "Tratamentos", duracao_minutos: 120, preco: 210.00, descricao: "Progressiva para cabelo curto." },
  { id: 11, nome: "Progressiva - cabelo médio", grupo: "Progressiva", variacao: "Cabelo Médio", categoria: "Tratamentos", duracao_minutos: 120, preco: 260.00, descricao: "Progressiva para cabelo médio." },
  { id: 12, nome: "Progressiva - cabelo longo", grupo: "Progressiva", variacao: "Cabelo Longo", categoria: "Tratamentos", duracao_minutos: 120, preco: 310.00, descricao: "Progressiva para cabelo longo." },
  { id: 13, nome: "Progressiva - retoque de raiz", grupo: "Progressiva", variacao: "Retoque de Raiz", categoria: "Tratamentos", duracao_minutos: 120, preco: 160.00, descricao: "Retoque de raiz da progressiva." },

  // SELANTE
  { id: 14, nome: "Selante - cabelo curto", grupo: "Selante", variacao: "Cabelo Curto", categoria: "Tratamentos", duracao_minutos: 120, preco: 160.00, descricao: "Selante para cabelo curto." },
  { id: 15, nome: "Selante - cabelo médio", grupo: "Selante", variacao: "Cabelo Médio", categoria: "Tratamentos", duracao_minutos: 120, preco: 210.00, descricao: "Selante para cabelo médio." },
  { id: 16, nome: "Selante - cabelo longo", grupo: "Selante", variacao: "Cabelo Longo", categoria: "Tratamentos", duracao_minutos: 120, preco: 260.00, descricao: "Selante para cabelo longo." },
  { id: 17, nome: "Selante - retoque de raiz", grupo: "Selante", variacao: "Retoque de Raiz", categoria: "Tratamentos", duracao_minutos: 120, preco: 130.00, descricao: "Retoque de raiz do selante." },

  // BOTOX
  { id: 18, nome: "Botox - cabelo curto", grupo: "Botox", variacao: "Cabelo Curto", categoria: "Tratamentos", duracao_minutos: 120, preco: 140.00, descricao: "Botox para cabelo curto." },
  { id: 19, nome: "Botox - cabelo médio", grupo: "Botox", variacao: "Cabelo Médio", categoria: "Tratamentos", duracao_minutos: 120, preco: 170.00, descricao: "Botox para cabelo médio." },
  { id: 20, nome: "Botox - cabelo longo", grupo: "Botox", variacao: "Cabelo Longo", categoria: "Tratamentos", duracao_minutos: 120, preco: 210.00, descricao: "Botox para cabelo longo." },

  // DEFINITIVA
  { id: 25, nome: "Definitiva - cabelo curto", grupo: "Definitiva", variacao: "Cabelo Curto", categoria: "Tratamentos", duracao_minutos: 120, preco: 290.00, descricao: "Definitiva para cabelo curto." },
  { id: 26, nome: "Definitiva - cabelo médio", grupo: "Definitiva", variacao: "Cabelo Médio", categoria: "Tratamentos", duracao_minutos: 120, preco: 310.00, descricao: "Definitiva para cabelo médio." },
  { id: 27, nome: "Definitiva - cabelo longo", grupo: "Definitiva", variacao: "Cabelo Longo", categoria: "Tratamentos", duracao_minutos: 120, preco: 360.00, descricao: "Definitiva para cabelo longo." },
  { id: 28, nome: "Definitiva - retoque de raiz", grupo: "Definitiva", variacao: "Retoque de Raiz", categoria: "Tratamentos", duracao_minutos: 120, preco: 210.00, descricao: "Retoque de raiz da definitiva." },

  // UNHAS / MANICURE & PEDICURE
  { id: 29, nome: "Manicure", grupo: "Unhas", variacao: "Manicure", categoria: "Unhas", duracao_minutos: 40, preco: 23.00, descricao: "Serviço de manicure." },
  { id: 30, nome: "Pedicure", grupo: "Unhas", variacao: "Pedicure", categoria: "Unhas", duracao_minutos: 40, preco: 32.00, descricao: "Serviço de pedicure." },
  { id: 31, nome: "Manicure e pedicure", grupo: "Unhas", variacao: "Mãos e Pés", categoria: "Unhas", duracao_minutos: 90, preco: 52.00, descricao: "Serviço completo de mãos e pés." },
  { id: 32, nome: "Esmaltação das mãos", grupo: "Unhas", variacao: "Esmaltação Mãos", categoria: "Unhas", duracao_minutos: 20, preco: 15.00, descricao: "Esmaltação sem retirada de cutícula." },
  { id: 33, nome: "Esmaltação dos pés", grupo: "Unhas", variacao: "Esmaltação Pés", categoria: "Unhas", duracao_minutos: 20, preco: 17.00, descricao: "Esmaltação sem retirada de cutícula." },
  { id: 34, nome: "Corte das unhas dos pés", grupo: "Unhas", variacao: "Corte Pés", categoria: "Unhas", duracao_minutos: 20, preco: 12.00, descricao: "Corte das unhas dos pés." },
  { id: 35, nome: "Manicure e pedicure masculino", grupo: "Unhas", variacao: "Masculino Mãos e Pés", categoria: "Unhas", duracao_minutos: 90, preco: 40.00, descricao: "Serviço masculino de manicure e pedicure." }
];

const MOCK_PROFISSIONAIS: Professional[] = [
  { id: 1, nome: 'Camila Rocha', especializacao: 'Especialista em Química e Cortes', descricao: 'Especialista em tratamentos capilares, cortes e coloração.' },
  { id: 2, nome: 'Beatriz Santos', especializacao: 'Designer & Estética Capilar', descricao: 'Especialista em alisamentos, hidratação e finalização.' },
  { id: 3, nome: 'Juliana Martins', especializacao: 'Manicure & Pedicure', descricao: 'Especialista em cuidados das mãos, pés e cutilagem.' }
];

const TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const BLOCKED_TIMES = ['10:00', '15:00'];

const STEP_LABELS: Step[] = ['service', 'professional', 'date', 'time', 'confirm'];
const STEP_NAMES = ['Serviço', 'Profissional', 'Data', 'Horário', 'Confirmar'];

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
  initialServiceId,
  initialGroupName
}: BookingProps) {
  const [step, setStep] = useState<Step>('service');
  
  const [servicos, setServicos] = useState<Service[]>(MOCK_SERVICOS);
  const [profissionais, setProfissionais] = useState<Professional[]>(MOCK_PROFISSIONAIS);
  
  const [selectedGroup, setSelectedGroup] = useState<string | null>(initialGroupName || null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const todayDate = getBrasiliaToday();
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const todayDay = todayDate.getDate();

  const monthName = todayDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const calDays = generateCalendar(year, month);

  // Busca serviços do backend; usa fallback se o banco estive offline
  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await fetch('http://localhost:3000/servicos');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) setServicos(data);
        }
      } catch (err) {
        console.warn('Backend indisponível. Utilizando catálogo mockado.');
      }
    };
    fetchServicos();
  }, []);

  // Trata a pré-seleção por Grupo vindo da Home
  useEffect(() => {
    if (initialGroupName && servicos.length > 0) {
      setSelectedGroup(initialGroupName);
      const grupoNormalizado = initialGroupName.toLowerCase();
      
      const variaveis = servicos.filter(
        s => s.grupo?.toLowerCase() === grupoNormalizado || s.nome.toLowerCase().includes(grupoNormalizado)
      );

      if (variaveis.length === 1) {
        setSelectedService(variaveis[0]);
      }
    } else if (initialServiceId && servicos.length > 0) {
      const enc = servicos.find(s => Number(s.id) === Number(initialServiceId));
      if (enc) {
        setSelectedService(enc);
        if (enc.grupo) setSelectedGroup(enc.grupo);
      }
    }
  }, [initialGroupName, initialServiceId, servicos]);

  // Lista de variações do grupo atualmente ativo
  const subServicosDoGrupo = selectedGroup
    ? servicos.filter(
        s => s.grupo?.toLowerCase() === selectedGroup.toLowerCase() ||
             s.nome.toLowerCase().includes(selectedGroup.toLowerCase())
      )
    : [];

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
    setIsSubmitting(true);
    const formattedDate = selectedDay
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
      : '';

    try {
      await fetch('http://localhost:3000/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: 1,
          servico_id: selectedService?.id,
          profissional_id: selectedPro?.id,
          data: formattedDate,
          horario_inicio: selectedTime,
          status: 'Agendado'
        }),
      });
    } catch (err) {
      console.warn('Backend indisponível, simulando agendamento concluído.');
    } finally {
      setIsSubmitting(false);
      setStep('success');
    }
  };

  // TELA DE SUCESSO (TELA VERDE)
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
            {selectedService?.variacao && <Row label="Variação" value={selectedService.variacao} />}
            <Row label="Profissional" value={selectedPro?.nome ?? '—'} />
            <Row label="Data" value={selectedDay ? `${String(selectedDay).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}` : '—'} />
            <Row label="Horário" value={selectedTime ?? '—'} />
            <Row label="Valor" value={selectedService ? `R$ ${Number(selectedService.preco).toFixed(2).replace('.', ',')}` : '—'} />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (onBookingSuccess) onBookingSuccess();
                if (onNavigateMyAppointments) onNavigateMyAppointments();
              }}
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
      {/* Topbar */}
      <div className="border-b border-[#f0ece9] bg-white py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={onNavigateHome} className="font-serif italic text-xl font-semibold text-[#3a2e2b] cursor-pointer">
            Ke Bella
          </button>
          <button onClick={onNavigateHome} className="text-sm text-[#a09692] hover:text-[#3a2e2b] transition-colors cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-[#f0ece9] bg-[#f8f5f2] py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between sm:justify-start gap-2">
          {STEP_LABELS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i < stepIndex ? 'bg-[#a3644f] text-white' :
                i === stepIndex ? 'bg-[#a3644f] text-white ring-4 ring-[#a3644f]/20' :
                'bg-[#e5ded8] text-[#a09692]'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? 'text-[#3a2e2b]' : 'text-[#a09692]'}`}>
                {STEP_NAMES[i]}
              </span>
              {i < STEP_LABELS.length - 1 && <div className="h-px w-6 sm:w-12 bg-[#e5ded8]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo Centralizado */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* PASSO 1: SERVIÇOS / GRUPOS */}
        {step === 'service' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">
              {selectedGroup ? `Opções para ${selectedGroup}` : 'Escolha o serviço'}
            </h2>
            <p className="text-[#a09692] text-sm mb-8">
              {selectedGroup
                ? `Selecione a especificação ou tamanho desejado para ${selectedGroup}`
                : 'Selecione o procedimento que deseja agendar'}
            </p>

            {/* Banner de Grupo Selecionado */}
            {selectedGroup && (
              <div className="bg-[#f8f5f2] p-4 rounded-xl border border-[#a3644f]/30 flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-[#a3644f]">Grupo selecionado: {selectedGroup}</span>
                <button
                  onClick={() => { setSelectedGroup(null); setSelectedService(null); }}
                  className="text-xs text-[#a09692] underline hover:text-[#3a2e2b] cursor-pointer"
                >
                  Ver todas as categorias
                </button>
              </div>
            )}

            {/* Lista de Variações do Grupo ou Lista Geral */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(selectedGroup ? subServicosDoGrupo : servicos).map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setSelectedPro(null); }}
                  className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedService?.id === svc.id ? 'border-[#a3644f] bg-[#f8f5f2]' : 'border-[#e5ded8] bg-white hover:border-[#a3644f]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#3a2e2b]">{svc.variacao || svc.nome}</h3>
                    {selectedService?.id === svc.id && <span className="text-[#a3644f] font-bold">✓</span>}
                  </div>
                  <p className="text-xs text-[#a09692] mb-3">{svc.descricao}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#a09692]">{svc.duracao_minutos || 30} min</span>
                    <span className="font-semibold text-[#a3644f]">R$ {Number(svc.preco).toFixed(2).replace('.', ',')}</span>
                  </div>
                </button>
              ))}
            </div>

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
              Profissionais disponíveis para: <strong>{selectedService?.nome}</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {profissionais.map((pro) => (
                <button
                  key={pro.id}
                  onClick={() => setSelectedPro(pro)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                    selectedPro?.id === pro.id ? 'border-[#a3644f] bg-[#f8f5f2]' : 'border-[#e5ded8] bg-white hover:border-[#a3644f]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#a3644f]/10 text-[#a3644f] font-bold text-lg flex items-center justify-center shrink-0">
                    {pro.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3a2e2b]">{pro.nome}</h3>
                    <p className="text-xs text-[#a3644f] mb-1">{pro.especializacao}</p>
                    <p className="text-xs text-[#a09692] line-clamp-1">{pro.descricao}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] cursor-pointer">
                Voltar
              </button>
              <button onClick={goNext} disabled={!selectedPro} className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] disabled:opacity-40 cursor-pointer">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: DATA */}
        {step === 'date' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Escolha a data</h2>
            <p className="text-[#a09692] text-sm mb-8">Selecione o dia do seu atendimento</p>

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
                  const isSelected = day === selectedDay;

                  return (
                    <button
                      key={day}
                      disabled={isPastOrToday}
                      onClick={() => setSelectedDay(day)}
                      className={`h-9 rounded-lg text-sm transition-all cursor-pointer ${
                        isSelected ? 'bg-[#a3644f] text-white font-semibold' :
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

            <div className="flex justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] cursor-pointer">
                Voltar
              </button>
              <button onClick={goNext} disabled={!selectedDay} className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] disabled:opacity-40 cursor-pointer">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 4: HORÁRIO */}
        {step === 'time' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Escolha o horário</h2>
            <p className="text-[#a09692] text-sm mb-8">Horários para dia {selectedDay}/{String(month + 1).padStart(2, '0')}/{year}</p>

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
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] cursor-pointer">
                Voltar
              </button>
              <button onClick={goNext} disabled={!selectedTime} className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] disabled:opacity-40 cursor-pointer">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 5: CONFIRMAÇÃO */}
        {step === 'confirm' && (
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-2 text-[#3a2e2b]">Confirmar agendamento</h2>
            <p className="text-[#a09692] text-sm mb-8">Revise os detalhes antes de confirmar</p>

            <div className="bg-white border border-[#e5ded8] rounded-2xl p-6 mb-6 space-y-4 shadow-sm">
              <Row label="Serviço" value={selectedService?.nome ?? '—'} />
              {selectedService?.variacao && <Row label="Variação" value={selectedService.variacao} />}
              <Row label="Profissional" value={selectedPro?.nome ?? '—'} />
              <Row label="Data" value={selectedDay ? `${String(selectedDay).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}` : '—'} />
              <Row label="Horário" value={selectedTime ?? '—'} />
              <div className="pt-3 border-t border-[#f0ece9]">
                <Row label="Total" value={`R$ ${selectedService ? Number(selectedService.preco).toFixed(2).replace('.', ',') : '—'}`} bold />
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={goBack} className="border border-[#e5ded8] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#f8f5f2] cursor-pointer">
                Voltar
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="bg-[#a3644f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#8a4f3d] cursor-pointer"
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