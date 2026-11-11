import React, { useState, useEffect } from 'react';
import { User, LogOut, Calendar, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  onNavigateLogin?: () => void;
  onNavigateBooking?: () => void;
  onNavigateDashboard?: () => void;
}

export function Header({ onNavigateLogin, onNavigateBooking, onNavigateDashboard }: HeaderProps) {
  const [user, setUser] = useState<{ id?: number; nome?: string; name?: string; email?: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Lê a sessão do localStorage
  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('ke_bella_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error('Erro ao ler usuário:', err);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    window.addEventListener('storage', loadUserFromStorage);
    window.addEventListener('focus', loadUserFromStorage);

    return () => {
      window.removeEventListener('storage', loadUserFromStorage);
      window.removeEventListener('focus', loadUserFromStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ke_bella_token');
    localStorage.removeItem('ke_bella_user');
    setUser(null);
    setShowUserMenu(false);
    window.location.reload();
  };

  // Pega o nome do usuário (aceita tanto 'nome' quanto 'name' vindo do backend)
  const rawName = user?.nome || user?.name || '';
  const initialLetter = rawName ? rawName.trim().charAt(0).toUpperCase() : 'U';
  const firstName = rawName ? rawName.trim().split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'Perfil');
  const fullName = rawName || user?.email || 'Usuário';

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#f0ece9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-serif italic text-2xl tracking-wide text-[#3a2e2b]">Ke Bella</span>
        </div>

        {/* Links de Navegação */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#6e635f]">
          <a href="#inicio" className="hover:text-[#a3644f] transition-colors">Início</a>
          <a href="#servicos" className="hover:text-[#a3644f] transition-colors">Serviços</a>
          <a href="#produtos" className="hover:text-[#a3644f] transition-colors">Produtos</a>
        </nav>

        {/* Ações da Direita */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#6e635f] hover:text-[#3a2e2b] transition-colors cursor-pointer">
            <ShoppingBag className="w-5 h-5" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 py-1.5 px-3.5 rounded-full hover:bg-[#f8f5f2] border border-[#a3644f]/30 transition-all cursor-pointer bg-white shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#a3644f] text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                  {initialLetter}
                </div>
                <span className="text-xs font-semibold text-[#3a2e2b] max-w-[120px] truncate capitalize">
                  {firstName}
                </span>
              </button>

              {/* Menu Dropdown do Perfil */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#f0ece9] py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-[#f0ece9]">
                    <p className="text-xs font-bold text-[#3a2e2b] truncate capitalize">{fullName}</p>
                    {user.email && <p className="text-[10px] text-[#a09692] truncate">{user.email}</p>}
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onNavigateDashboard) {
                        onNavigateDashboard();
                      } else if (onNavigateBooking) {
                        onNavigateBooking();
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#3a2e2b] hover:bg-[#f8f5f2] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#a3644f]" />
                    Meus Agendamentos
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-[#f0ece9]"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onNavigateLogin}
              className="text-xs font-semibold uppercase tracking-wider text-[#3a2e2b] hover:text-[#a3644f] transition-colors cursor-pointer px-3 py-2"
            >
              Entrar
            </button>
          )}

          <button
            onClick={onNavigateBooking}
            className="py-2.5 px-5 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm transition-all cursor-pointer"
          >
            Agende agora
          </button>
        </div>

      </div>
    </header>
  );
}