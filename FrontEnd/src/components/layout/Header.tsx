import { ShoppingBag } from 'lucide-react';

export function Header() {
  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#f0ece9] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <span 
            onClick={() => scrollToSection('top')}
            className="font-serif italic text-3xl font-normal text-[#3a2e2b] tracking-wide cursor-pointer"
          >
            Ke Bella
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-10 font-medium text-sm text-[#6e635f]">
          <button 
            onClick={() => scrollToSection('top')} 
            className="text-[#3a2e2b] font-semibold hover:text-[#a3644f] transition-colors cursor-pointer"
          >
            Início
          </button>
          
          <button 
            onClick={() => scrollToSection('servicos')} 
            className="hover:text-[#a3644f] transition-colors cursor-pointer"
          >
            Serviços
          </button>

          <button 
            onClick={() => scrollToSection('produtos')} 
            className="hover:text-[#a3644f] transition-colors cursor-pointer"
          >
            Produtos
          </button>
        </nav>

        <div className="flex items-center gap-6">
          <button className="text-[#6e635f] hover:text-[#a3644f] transition-colors p-1" title="Carrinho">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
          </button>
          <button className="text-sm font-semibold text-[#3a2e2b] hover:text-[#a3644f] transition-colors px-2 py-1">
            Entrar
          </button>
          <button className="text-sm font-medium bg-[#a3644f] hover:bg-[#8a4f3d] text-white px-5 py-2.5 rounded-xl shadow-sm transition-all">
            Agende agora
          </button>
        </div>
      </div>
    </header>
  );
}
