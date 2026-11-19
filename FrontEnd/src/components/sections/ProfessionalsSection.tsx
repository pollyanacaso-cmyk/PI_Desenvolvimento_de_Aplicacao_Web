import { useEffect, useState } from 'react';
import { MessageCircle, Users } from 'lucide-react';

const API_URL = 'http://localhost:3000';

interface Profissional {
  id: number;
  nome: string;
  especializacao?: string | null;
  telefone?: string | null;
  foto_url?: string | null;
  ativo?: boolean;
}

interface DadosContatoEquipe {
  foto: string;
  telefone: string;
  posicaoFoto?: string;
}

const equipePorNome: Record<string, DadosContatoEquipe> = {
  'wagner francisco colli tonietti': {
    foto: '/Images/profissionais/wagner.jpg',
    telefone: '+55 19 98930-1353',
    posicaoFoto: '50% 12%',
  },
  'ana sunta lorenzetto colli tonietti': {
    foto: '/Images/profissionais/ana.jpg',
    telefone: '+55 19 99133-0780',
  },
  'simone cristina colli': {
    foto: '/Images/profissionais/simone.jpg',
    telefone: '+55 19 99984-8015',
    posicaoFoto: '50% 12%',
  },
  'lucimara lorenzetto colli': {
    foto: '/Images/profissionais/lucimara.jpg',
    telefone: '+55 19 98901-2404',
    posicaoFoto: '50% 75%',
  },
};

function normalizarNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function linkWhatsApp(telefone?: string | null): string | null {
  const digitos = String(telefone ?? '').replace(/\D/g, '');
  if (digitos.length < 10) return null;
  const completo = digitos.startsWith('55') && digitos.length >= 12 ? digitos : `55${digitos}`;
  return `https://wa.me/${completo}`;
}

function formatarTelefone(telefone?: string | null): string {
  const d = String(telefone ?? '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(telefone ?? '');
}

function iniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function ProfessionalsSection() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const resp = await fetch(`${API_URL}/profissionais`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (cancelado) return;
        const lista: Profissional[] = Array.isArray(data) ? data : [];
        setProfissionais(lista.filter((p) => p.ativo !== false));
      } catch (e) {
        console.error('Erro ao carregar profissionais:', e);
        if (!cancelado) setErro(true);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  return (
    <section id="profissionais" className="scroll-mt-24 w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#e5ded8]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#a3644f]/10 border border-[#a3644f]/20 text-[#a3644f] text-xs font-semibold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            Nossa equipe
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#3a2e2b] leading-tight">
            Conheça nossas <span className="italic text-[#a3644f]">profissionais</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6e635f] leading-relaxed">
            Ficou com alguma dúvida? Fale direto com a profissional pelo WhatsApp.
          </p>
        </div>

        {carregando ? (
          <p className="text-center text-xs text-[#a09692]">Carregando profissionais...</p>
        ) : erro ? (
          <p className="text-center text-xs text-[#a09692]">Não foi possível carregar as profissionais no momento.</p>
        ) : profissionais.length === 0 ? (
          <p className="text-center text-xs text-[#a09692]">Nenhuma profissional cadastrada no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profissionais.map((p) => {
              const dadosEquipe = equipePorNome[normalizarNome(p.nome)];
              const telefone = dadosEquipe?.telefone ?? p.telefone;
              const foto = dadosEquipe?.foto ?? p.foto_url;
              const posicaoFoto = dadosEquipe?.posicaoFoto ?? 'center';
              const wa = linkWhatsApp(telefone);

              return (
                <article
                  key={p.id}
                  className="bg-[#f8f5f2] border border-[#f0ece9] rounded-3xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  {foto ? (
                    <img
                      src={foto}
                      alt={`Foto de ${p.nome}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4"
                      style={{ objectPosition: posicaoFoto }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c28a76] to-[#a3644f] text-white font-serif text-3xl flex items-center justify-center border-4 border-white shadow-md mb-4"
                      aria-hidden="true"
                    >
                      {iniciais(p.nome)}
                    </div>
                  )}

                  <h3 className="font-serif text-xl font-semibold text-[#3a2e2b]">{p.nome}</h3>
                  <p className="text-xs italic text-[#a3644f] mt-1 mb-4 min-h-[1rem]">
                    {p.especializacao || 'Profissional do salão'}
                  </p>

                  <div className="mt-auto w-full pt-4 border-t border-[#e5ded8] space-y-3">
                    {wa ? (
                      <>
                        <p className="text-xs text-[#6e635f]">{formatarTelefone(telefone)}</p>
                        <a
                          href={wa}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chamar no WhatsApp
                        </a>
                      </>
                    ) : (
                      <p className="text-xs text-[#a09692]">Contato não informado</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProfessionalsSection;
