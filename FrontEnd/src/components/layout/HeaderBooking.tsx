import { ShoppingBag } from 'lucide-react';

interface HeaderBookingProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
}

export function HeaderBooking({ onNavigateHome, onNavigateLogin }: HeaderBookingProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#f0ece9] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Logo que clica e volta para a tela inicial */}
        <div className="flex items-center">
          <span 
            onClick={onNavigateHome}
            className="font-serif italic text-3xl font-normal text-[#3a2e2b] tracking-wide cursor-pointer select-none"
          >
            Ke Bella
          </span>
        </div>

        {/* Lado Direito: Carrinho e Entrar */}
        <div className="flex items-center gap-6">
          <button className="text-[#6e635f] hover:text-[#a3644f] transition-colors p-1 cursor-pointer" title="Carrinho">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button 
            onClick={onNavigateLogin}
            className="text-sm font-semibold text-[#3a2e2b] hover:text-[#a3644f] transition-colors px-2 py-1 cursor-pointer"
          >
            Entrar
          </button>
        </div>

      </div>
    </header>
  );
}