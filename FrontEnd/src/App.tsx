import React, { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CartBar, { type ItemCarrinho } from './components/ui/CartBar';
import { limparSessao, ouvirSessao, tokenExpirado } from './utils/sessao';

type Usuario = { id: number; nome: string; email?: string; tipo?: 'cliente' | 'admin' | 'profissional'; profissional_id?: number };
type PaginaAtual = 'home' | 'services' | 'booking' | 'login' | 'dashboard' | 'admin';
function lerUsuario(): Usuario | null {
  try {
    const raw = localStorage.getItem('ke_bella_user') || localStorage.getItem('cliente') || localStorage.getItem('usuario');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id ? u : null;
  } catch { return null; }
}
export function App() {
  const [currentPage, setCurrentPage] = useState<PaginaAtual>('home');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | undefined>();
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(() => lerUsuario());
  const rolarParaProfissionais = useRef(false);
  const [avisoLogin, setAvisoLogin] = useState('');

  // Sessão vencida (token de 8h) ou recusada pela API: sai da conta e leva ao login com um aviso claro.
  const encerrarSessaoExpirada = useRef(() => {});
  encerrarSessaoExpirada.current = () => {
    if (!lerUsuario()) return;
    limparSessao();
    setUsuario(null);
    setAvisoLogin('Sua sessão expirou. Faça login novamente para continuar.');
    setCurrentPage('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Confere o prazo do token ao abrir, a cada 30s e ao voltar para a aba.
  useEffect(() => {
    const verificar = () => {
      if (lerUsuario() && tokenExpirado()) encerrarSessaoExpirada.current();
    };
    verificar();
    const timer = window.setInterval(verificar, 30000);
    window.addEventListener('focus', verificar);
    document.addEventListener('visibilitychange', verificar);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', verificar);
      document.removeEventListener('visibilitychange', verificar);
    };
  }, []);

  // Se a API recusar o token (401) em qualquer tela, trata como sessão expirada.
  useEffect(() => {
    const fetchOriginal = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const resposta = await fetchOriginal.apply(window, args);
      if (resposta.status === 401) {
        const pedido = args[0] instanceof Request ? args[0] : null;
        const headers = new Headers(args[1]?.headers ?? pedido?.headers);
        if (headers.has('Authorization')) encerrarSessaoExpirada.current();
      }
      return resposta;
    };
    return () => { window.fetch = fetchOriginal; };
  }, []);

  // Depois de voltar para a Home, rola até a seção Profissionais (espera o elemento montar)
  useEffect(() => {
    if (currentPage !== 'home' || !rolarParaProfissionais.current) return;
    let tentativas = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById('profissionais');
      tentativas++;
      if (el || tentativas > 30) {
        window.clearInterval(timer);
        rolarParaProfissionais.current = false;
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [currentPage]);

  useEffect(() => ouvirSessao(() => setUsuario(lerUsuario())), []);
  const handleNavigateHome = () => { setCurrentPage('home'); setCategoriaSelecionada(undefined); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleNavigateProfessionals = () => {
    if (currentPage === 'home') { document.getElementById('profissionais')?.scrollIntoView({ behavior: 'smooth' }); return; }
    rolarParaProfissionais.current = true;
    setCategoriaSelecionada(undefined);
    setCurrentPage('home');
  };
  const handleNavigateServices = (categoriaId?: string) => { setCategoriaSelecionada(categoriaId); setCurrentPage('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleNavigateBooking = () => { setCurrentPage('booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleNavigateLogin = () => { setAvisoLogin(''); setCurrentPage('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleNavigateDashboard = () => { setCurrentPage(usuario?.tipo === 'admin' || usuario?.tipo === 'profissional' ? 'admin' : 'dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleLoginSuccess = () => {
    const atual = lerUsuario(); setUsuario(atual); setAvisoLogin('');
    if (atual?.tipo === 'admin' || atual?.tipo === 'profissional') setCurrentPage('admin');
    else setCurrentPage(itensCarrinho.length > 0 ? 'booking' : 'home');
  };
  const handleLogout = () => { limparSessao(); setUsuario(null); setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : '';
  const propsHome = { onNavigateServices: handleNavigateServices, onNavigateBooking: handleNavigateBooking, onNavigateLogin: handleNavigateLogin, onNavigateDashboard: handleNavigateDashboard, onLogout: handleLogout, usuarioNome: primeiroNome, usuarioTipo: usuario?.tipo, carrinhoCount: itensCarrinho.length };
  return <div className="min-h-screen bg-[#f8f5f2] text-[#3a2e2b] font-sans antialiased selection:bg-[#a3644f] selection:text-white">
    {currentPage === 'home' && <Home {...propsHome} />}
    {currentPage === 'services' && <Services categoriaInicial={categoriaSelecionada} onNavigateHome={handleNavigateHome} onNavigateProfessionals={handleNavigateProfessionals} onNavigateBooking={handleNavigateBooking} itensCarrinho={itensCarrinho} setItensCarrinho={setItensCarrinho} onNavigateLogin={handleNavigateLogin} onNavigateDashboard={handleNavigateDashboard} onLogout={handleLogout} usuarioNome={primeiroNome} usuarioTipo={usuario?.tipo}/>}
    {currentPage === 'booking' && <Booking onNavigateHome={handleNavigateHome} onNavigateServices={() => handleNavigateServices()} onNavigateLogin={handleNavigateLogin} onNavigateDashboard={handleNavigateDashboard} onLogout={handleLogout} onLimparCarrinho={() => setItensCarrinho([])} onAtualizarCarrinho={setItensCarrinho} clienteLogado={usuario?.tipo === 'cliente' ? usuario : null} agendamentoDados={{ servicosSelecionados: itensCarrinho }}/>}
    {currentPage === 'login' && <Login onNavigateHome={handleNavigateHome} onNavigateProfessionals={handleNavigateProfessionals} onLoginSuccess={handleLoginSuccess} aviso={avisoLogin}/>}
    {currentPage === 'dashboard' && <ClientDashboard key={usuario?.id ?? 'sem-sessao'} onNavigateHome={handleNavigateHome} onNavigateProfessionals={handleNavigateProfessionals} onNavigateBooking={handleNavigateBooking} onLogout={handleLogout}/>}
    {currentPage === 'admin' && usuario && (usuario.tipo === 'admin' || usuario.tipo === 'profissional') && <AdminDashboard usuario={usuario as any} onLogout={handleLogout}/>}
    {(currentPage === 'home' || currentPage === 'services') && <CartBar itensCarrinho={itensCarrinho} onAvancar={handleNavigateBooking} onRemover={(id) => setItensCarrinho(prev => prev.filter(item => item.servico.id !== id))}/>}
  </div>;
}
export default App;
