import type React from 'react';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  aberto: boolean;
  titulo: string;
  descricao?: React.ReactNode;
  textoConfirmar?: string;
  textoVoltar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onVoltar: () => void;
}

export default function ConfirmModal({
  aberto,
  titulo,
  descricao,
  textoConfirmar = 'Confirmar cancelamento',
  textoVoltar = 'Manter agendamento',
  carregando = false,
  onConfirmar,
  onVoltar
}: ConfirmModalProps) {
  // Fecha com ESC (exceto durante o envio)
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !carregando) onVoltar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, carregando, onVoltar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3a2e2b]/50 backdrop-blur-sm"
      onClick={() => { if (!carregando) onVoltar(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-titulo"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-[#f0ece9] shadow-2xl p-7 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-[#a3644f]/10 text-[#a3644f] flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 id="confirm-modal-titulo" className="font-serif text-2xl font-semibold text-[#3a2e2b] mb-2">
          {titulo}
        </h2>
        {descricao && <div className="text-sm text-[#6e635f] leading-relaxed mb-6">{descricao}</div>}

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onVoltar}
            disabled={carregando}
            className="flex-1 py-3 rounded-full border border-[#e5ded8] bg-white text-[#3a2e2b] text-xs font-semibold hover:bg-[#f8f5f2] transition-colors cursor-pointer disabled:opacity-50"
          >
            {textoVoltar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className="flex-1 py-3 rounded-full bg-[#a3644f] text-white text-xs font-semibold hover:bg-[#8a4f3d] transition-colors cursor-pointer shadow-sm disabled:opacity-60"
          >
            {carregando ? 'Cancelando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
