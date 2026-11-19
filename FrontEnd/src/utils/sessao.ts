// Sessão do cliente no navegador.
// O Login grava em 'ke_bella_user' / 'ke_bella_token'; as chaves antigas
// ('cliente', 'usuario', 'token') continuam sendo lidas por compatibilidade.

export interface ClienteLogado {
  id: number;
  nome: string;
  email?: string;
  tipo?: string;
}

const CHAVES_USUARIO = ['ke_bella_user', 'cliente', 'usuario'];
const CHAVES_TOKEN = ['ke_bella_token', 'token'];

// Evento disparado sempre que a sessão é gravada ou apagada. É ele que mantém
// App, Header, Booking e ClientDashboard sincronizados sem recarregar a página.
export const EVENTO_SESSAO = 'ke-bella-sessao';

function notificarSessao(): void {
  window.dispatchEvent(new Event(EVENTO_SESSAO));
}

// Grava a sessão (usuário + token) e avisa quem estiver escutando.
export function salvarSessao(usuario: unknown, token?: string | null): void {
  try {
    // Garante que não sobra sessão antiga em chaves legadas
    for (const chave of [...CHAVES_USUARIO, ...CHAVES_TOKEN]) {
      localStorage.removeItem(chave);
    }
    localStorage.setItem('ke_bella_user', JSON.stringify(usuario));
    if (token) localStorage.setItem('ke_bella_token', token);
  } catch {
    // localStorage indisponível
  }
  notificarSessao();
}

// Escuta mudanças de sessão (nesta aba e em outras abas). Retorna a função de limpeza.
export function ouvirSessao(callback: () => void): () => void {
  window.addEventListener(EVENTO_SESSAO, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENTO_SESSAO, callback);
    window.removeEventListener('storage', callback);
  };
}

// Aceita somente clientes (administradores não agendam como cliente).
export function normalizarCliente(bruto: unknown): ClienteLogado | null {
  if (!bruto || typeof bruto !== 'object') return null;

  const obj = bruto as Record<string, unknown>;
  const id = Number(obj.id ?? obj.cliente_id);

  if (!Number.isInteger(id) || id <= 0) return null;
  if (obj.tipo === 'admin') return null;

  return {
    id,
    nome: typeof obj.nome === 'string' ? obj.nome : 'Cliente',
    email: typeof obj.email === 'string' ? obj.email : undefined,
    tipo: typeof obj.tipo === 'string' ? obj.tipo : undefined
  };
}

export function lerClienteSalvo(): ClienteLogado | null {
  for (const chave of CHAVES_USUARIO) {
    try {
      const salvo = localStorage.getItem(chave);
      if (!salvo) continue;

      const cliente = normalizarCliente(JSON.parse(salvo));
      if (cliente) return cliente;
    } catch {
      // JSON inválido ou localStorage indisponível: tenta a próxima chave
    }
  }
  return null;
}

export function lerToken(): string | null {
  try {
    for (const chave of CHAVES_TOKEN) {
      const token = localStorage.getItem(chave);
      if (token) return token;
    }
  } catch {
    // localStorage indisponível
  }
  return null;
}

// Lê o instante de expiração (campo "exp", em segundos) de dentro do JWT.
// Não valida a assinatura: quem valida é o BackEnd. Aqui serve só para saber o prazo.
function lerExpiracaoToken(token: string): number | null {
  try {
    const parte = token.split('.')[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    const completo = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const dados = JSON.parse(atob(completo));
    return typeof dados.exp === 'number' ? dados.exp : null;
  } catch {
    return null;
  }
}

// true quando existe um token salvo e o prazo dele (8h) já passou.
export function tokenExpirado(): boolean {
  const token = lerToken();
  if (!token) return false;
  const exp = lerExpiracaoToken(token);
  if (exp === null) return false;
  return Date.now() >= exp * 1000;
}

export function limparSessao(): void {
  try {
    for (const chave of [...CHAVES_USUARIO, ...CHAVES_TOKEN]) {
      localStorage.removeItem(chave);
    }
  } catch {
    // noop
  }
  notificarSessao();
} 
