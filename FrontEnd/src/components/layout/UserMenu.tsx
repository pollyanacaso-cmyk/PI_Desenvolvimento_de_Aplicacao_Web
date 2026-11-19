import { useEffect, useRef, useState } from 'react';
import { User, LogIn, CalendarDays, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
export interface UserMenuProps {
  usuarioNome?: string;
  usuarioTipo?: 'cliente' | 'admin' | 'profissional';
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
}
export function UserMenu({ usuarioNome, usuarioTipo = 'cliente', onNavigateLogin, onNavigateDashboard, onLogout }: UserMenuProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const outside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('mousedown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [aberto]);
  useEffect(() => { if (!usuarioNome) setAberto(false); }, [usuarioNome]);
  if (!usuarioNome) return <button onClick={onNavigateLogin} className="flex items-center gap-2 border border-[#e5ded8] hover:border-[#a3644f] rounded-full py-1.5 px-3 bg-white shadow-xs"><span className="w-6 h-6 rounded-full bg-[#a3644f] text-white flex items-center justify-center"><LogIn size={14}/></span><span className="text-xs font-semibold">Login</span></button>;
  const label = usuarioTipo === 'admin' ? 'Painel Administrativo' : usuarioTipo === 'profissional' ? 'Painel do Profissional' : 'Ver meus agendamentos';
  return <div ref={containerRef} className="relative">
    <button onClick={() => setAberto(v => !v)} aria-haspopup="menu" aria-expanded={aberto} className="flex items-center gap-2 border border-[#e5ded8] hover:border-[#a3644f] rounded-full py-1.5 px-3 bg-white shadow-xs"><span className="w-6 h-6 rounded-full bg-[#a3644f] text-white flex items-center justify-center text-xs font-bold">{usuarioNome.charAt(0)}</span><span className="text-xs font-semibold hidden sm:inline">{usuarioNome}</span><ChevronDown size={14} className="text-[#a09692]"/></button>
    {aberto && <div role="menu" className="absolute right-0 mt-2 w-56 bg-white border border-[#f0ece9] rounded-2xl shadow-xl py-2 z-50">
      <button role="menuitem" onClick={() => { setAberto(false); onNavigateDashboard?.(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#f8f5f2] text-left"><LayoutDashboard size={15} className="text-[#a3644f]"/>{label}</button>
      {usuarioTipo === 'profissional' && <button role="menuitem" onClick={() => { setAberto(false); onNavigateDashboard?.(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#f8f5f2] text-left"><CalendarDays size={15} className="text-[#a3644f]"/>Ver meus agendamentos</button>}
      <div className="my-1 border-t border-[#f0ece9]"/>
      <button role="menuitem" onClick={() => { setAberto(false); onLogout?.(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"><LogOut size={15}/>Sair da conta</button>
    </div>}
  </div>;
}
export default UserMenu;
