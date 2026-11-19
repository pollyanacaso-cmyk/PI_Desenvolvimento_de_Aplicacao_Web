import React from 'react';
import { CalendarCheck } from 'lucide-react';
import UserMenu from './UserMenu';

export interface HeaderProps {
  currentPage?: 'home' | 'services' | 'products' | 'booking' | 'dashboard' | string;
  onNavigate?: (page: any) => void;
  onNavigateLogin?: () => void;
  onNavigateBooking?: (params?: any) => void;
  onNavigateDashboard?: () => void;
  onNavigateServices?: () => void;
  onNavigateHome?: () => void;
  /** Leva até a seção Profissionais da Home (rola direto se já estiver na Home). */
  onNavigateProfessionals?: () => void;
  onLogout?: () => void;
  usuarioNome?: string;
  usuarioTipo?: 'cliente' | 'admin' | 'profissional';
  carrinhoCount?: number;
  /** Exibe o botão "AGENDE AGORA" (padrão: true). */
  mostrarBotaoAgendar?: boolean;
}

export function Header({
  currentPage = 'home',
  onNavigate,
  onNavigateLogin,
  onNavigateBooking,
  onNavigateDashboard,
  onNavigateServices,
  onNavigateHome,
  onNavigateProfessionals,
  onLogout,
  usuarioNome = '',
  usuarioTipo = 'cliente',
  carrinhoCount = 0,
  mostrarBotaoAgendar = true
}: HeaderProps) {
  
  const handleNav = (page: 'home' | 'services' | 'products' | 'booking' | 'dashboard') => {
    if (page === 'home' && onNavigateHome) {
      onNavigateHome();
    } else if ((page === 'booking' || page === 'services') && onNavigateServices) {
      onNavigateServices();
    } else if (page === 'booking' && onNavigateBooking) {
      onNavigateBooking();
    } else if (page === 'dashboard' && onNavigateDashboard) {
      onNavigateDashboard();
    } else if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#f0ece9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO KE BELLA */}
        <button
          onClick={() => handleNav('home')}
          className="font-serif text-2xl sm:text-3xl italic text-[#3a2e2b] hover:text-[#a3644f] transition-colors cursor-pointer"
        >
          Ke Bella
        </button>

        {/* MENU DE NAVEGAÇÃO CENTRALIZADO */}
        <nav className="flex items-center gap-6 sm:gap-10">
          <button
            onClick={() => handleNav('home')}
            className={`text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer relative py-1 ${
              currentPage === 'home'
                ? 'text-[#a3644f] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#a3644f]'
                : 'text-[#3a2e2b] hover:text-[#a3644f]'
            }`}
          >
            INÍCIO
          </button>

          <button
            onClick={() => handleNav('services')}
            className={`text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer relative py-1 ${
              currentPage === 'services'
                ? 'text-[#a3644f] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#a3644f]'
                : 'text-[#3a2e2b] hover:text-[#a3644f]'
            }`}
          >
            SERVIÇOS
          </button>

          <button
            onClick={() => onNavigateProfessionals?.()}
            className={`text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer relative py-1 ${
              currentPage === 'professionals'
                ? 'text-[#a3644f] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#a3644f]'
                : 'text-[#3a2e2b] hover:text-[#a3644f]'
            }`}
          >
            PROFISSIONAIS
          </button>
        </nav>

        {/* AÇÕES À DIREITA */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Ícone de Sacola / Carrinho */}
          <button
            onClick={() => handleNav('services')}
            className="p-2 text-[#3a2e2b] hover:text-[#a3644f] transition-colors relative cursor-pointer"
            title="Ver catálogo e agendamento"
          >
            <CalendarCheck className="w-5 h-5" />
            {carrinhoCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#a3644f] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {carrinhoCount}
              </span>
            )}
          </button>

          {/* Login (deslogado) ou mini card do usuário (logado) */}
          <UserMenu
            usuarioNome={usuarioNome}
            usuarioTipo={usuarioTipo}
            onNavigateLogin={onNavigateLogin}
            onNavigateDashboard={onNavigateDashboard} 
            onLogout={onLogout}
          />

          {/* Botão AGENDE AGORA (vai direto para a tela nova de serviços) */}
          {mostrarBotaoAgendar && (
            <button
              onClick={() => handleNav('services')}
              className="py-2.5 px-5 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
            >
              AGENDE AGORA
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
