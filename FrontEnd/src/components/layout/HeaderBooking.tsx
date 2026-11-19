import React from 'react';
import { CalendarCheck } from 'lucide-react';
import UserMenu from './UserMenu';

export interface HeaderBookingProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateServices?: () => void;
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
  usuarioNome?: string;
  carrinhoCount?: number;
}

export function HeaderBooking({ 
  onNavigateHome, 
  onNavigateLogin,
  onNavigateServices,
  onNavigateDashboard,
  onLogout,
  usuarioNome = '',
  carrinhoCount = 0
}: HeaderBookingProps) {
  
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#f0ece9] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO KE BELLA (Volta para a tela inicial) */}
        <div className="flex items-center">
          <button 
            onClick={onNavigateHome}
            className="font-serif italic text-2xl sm:text-3xl text-[#3a2e2b] hover:text-[#a3644f] transition-colors cursor-pointer select-none bg-transparent border-none p-0"
          >
            Ke Bella
          </button>
        </div>

        {/* LADO DIREITO: CARRINHO E PERFIL DA CLIENTE */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Botão de Carrinho que leva para o catálogo de serviços */}
          <button 
            onClick={() => {
              if (onNavigateServices) onNavigateServices();
              else if (onNavigateHome) onNavigateHome();
            }}
            className="text-[#6e635f] hover:text-[#a3644f] transition-colors p-2 cursor-pointer relative" 
            title="Ver catálogo de serviços"
          >
            <CalendarCheck className="w-5 h-5 stroke-[1.8]" />
            {carrinhoCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#a3644f] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {carrinhoCount}
              </span>
            )}
          </button>

          {/* Login (deslogado) ou mini card do usuário (logado) */}
          <UserMenu
            usuarioNome={usuarioNome}
            onNavigateLogin={onNavigateLogin}
            onNavigateDashboard={onNavigateDashboard}
            onLogout={onLogout}
          />

        </div>

      </div>
    </header>
  );
}

export default HeaderBooking;