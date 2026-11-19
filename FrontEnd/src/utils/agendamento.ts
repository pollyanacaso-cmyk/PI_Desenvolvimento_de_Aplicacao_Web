import type { ItemCarrinho } from '../components/ui/CartBar';

// ---------------------------------------------------------------
// Regras de expediente do Salão Ke Bella (valores em minutos)
// ---------------------------------------------------------------
export const ABERTURA_MIN = 8 * 60;            // 08:00
export const ALMOCO_INICIO_MIN = 12 * 60;      // 12:00
export const ALMOCO_FIM_MIN = 13 * 60 + 30;    // 13:30
export const FECHAMENTO_MIN = 20 * 60;         // 20:00
export const INTERVALO_SLOT = 20;              // grade de início a cada 20 min

export interface IntervaloOcupado {
  profissional_id: number;
  inicioMin: number;
  fimMin: number;
}

export interface EtapaLinhaDoTempo {
  item: ItemCarrinho;
  indexOriginal: number;
  inicioStr: string;
  fimStr: string;
  inicioMin: number;
  fimMin: number;
  disponivel: boolean;
  motivoConflito?: string;
}

export function horarioParaMinutos(h: string): number {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
}

export function minutosParaHorario(min: number): string {
  const hh = String(Math.floor(min / 60)).padStart(2, '0');
  const mm = String(min % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Manhã: 08:00, 08:20 ... 11:40  |  Tarde: 13:30, 13:50 ... 19:30
// (o último início da tarde é aquele em que ainda cabe o menor serviço, 20 min)
export function gerarSlots(): string[] {
  const slots: string[] = [];
  for (let m = ABERTURA_MIN; m < ALMOCO_INICIO_MIN; m += INTERVALO_SLOT) {
    slots.push(minutosParaHorario(m));
  }
  for (let m = ALMOCO_FIM_MIN; m + INTERVALO_SLOT <= FECHAMENTO_MIN; m += INTERVALO_SLOT) {
    slots.push(minutosParaHorario(m));
  }
  return slots;
}

// ---------------------------------------------------------------
// Linha do tempo em cascata: cada serviço começa quando o anterior termina.
// Valida almoço, fechamento e a agenda do profissional de cada etapa.
// ---------------------------------------------------------------
export function simularSequencia(
  itens: ItemCarrinho[],
  inicioMin: number,
  ocupados: IntervaloOcupado[]
): EtapaLinhaDoTempo[] {
  let cursor = inicioMin;

  return itens.map((item, idx) => {
    const duracao = Number(item.servico.duracao_minutos);
    const etapaInicio = cursor;
    const etapaFim = cursor + (duracao > 0 ? duracao : 0);
    cursor = etapaFim;

    let disponivel = true;
    let motivoConflito: string | undefined;

    if (!item.profissionalId) {
      disponivel = false;
      motivoConflito = 'Nenhum profissional foi escolhido para este serviço.';
    } else if (!(duracao > 0)) {
      disponivel = false;
      motivoConflito = 'Este serviço está sem duração cadastrada.';
    } else if (etapaInicio < ALMOCO_FIM_MIN && etapaFim > ALMOCO_INICIO_MIN) {
      disponivel = false;
      motivoConflito = 'Invade o horário de almoço do salão (12:00 às 13:30).';
    } else if (etapaFim > FECHAMENTO_MIN) {
      disponivel = false;
      motivoConflito = 'Ultrapassa o horário de fechamento do salão (20:00).';
    } else {
      const choque = ocupados.find(
        (oc) =>
          oc.profissional_id === Number(item.profissionalId) &&
          oc.inicioMin < etapaFim &&
          oc.fimMin > etapaInicio
      );
      if (choque) {
        disponivel = false;
        motivoConflito = `${item.profissionalNome || 'O profissional'} já está ocupado(a) entre ${minutosParaHorario(choque.inicioMin)} e ${minutosParaHorario(choque.fimMin)}.`;
      }
    }

    return {
      item,
      indexOriginal: idx,
      inicioStr: minutosParaHorario(etapaInicio),
      fimStr: minutosParaHorario(etapaFim),
      inicioMin: etapaInicio,
      fimMin: etapaFim,
      disponivel,
      motivoConflito
    };
  });
}

export function todasDisponiveis(etapas: EtapaLinhaDoTempo[]): boolean {
  return etapas.every((e) => e.disponivel);
}

function gerarPermutacoes<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const resultado: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const restantes = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of gerarPermutacoes(restantes)) {
      resultado.push([arr[i], ...perm]);
    }
  }
  return resultado;
}

// Botão 1 — procura uma ordem dos mesmos serviços em que tudo caiba a partir
// do MESMO horário inicial. Retorna null se nenhuma permutação resolver.
// (limitado a 6 serviços = 720 permutações, instantâneo)
export function encontrarOrdemSemConflito(
  itens: ItemCarrinho[],
  inicioMin: number,
  ocupados: IntervaloOcupado[]
): ItemCarrinho[] | null {
  if (itens.length <= 1 || itens.length > 6) return null;

  for (const perm of gerarPermutacoes(itens)) {
    if (todasDisponiveis(simularSequencia(perm, inicioMin, ocupados))) {
      return perm;
    }
  }
  return null;
}

// Botão 2 — separa os serviços indisponíveis. Remove um por vez e
// re-simula, porque tirar um serviço do meio da fila antecipa os seguintes
// (e eles podem passar a conflitar, ou deixar de conflitar).
export function separarConflitantes(
  itens: ItemCarrinho[],
  inicioMin: number,
  ocupados: IntervaloOcupado[]
): { mantidos: ItemCarrinho[]; adiados: ItemCarrinho[] } {
  const mantidos = [...itens];
  const adiados: ItemCarrinho[] = [];

  while (mantidos.length > 0) {
    const etapas = simularSequencia(mantidos, inicioMin, ocupados);
    const idx = etapas.findIndex((e) => !e.disponivel);
    if (idx === -1) break;
    adiados.push(mantidos.splice(idx, 1)[0]);
  }

  return { mantidos, adiados };
} 
