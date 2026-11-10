import { MapPin, Phone, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#181413] text-[#a89d97] py-16 px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Coluna 1 - Brand */}
        <div className="space-y-4 md:col-span-1">
          <span className="font-serif italic text-3xl text-white block">
            Ke Bella
          </span>
          <p className="text-xs leading-relaxed text-[#8a7f7a]">
            Beleza, sofisticação e cuidado em cada detalhe. Localizado em Espírito Santo do Pinhal, SP.
          </p>
          <div className="flex gap-3 pt-2">
            <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Coluna 2 - Navegação */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-white font-semibold">Navegação</h4>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-white transition-colors">Início</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Serviços</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Profissionais</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Produtos</a></li>
          </ul>
        </div>

        {/* Coluna 3 - Contato */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-xs uppercase tracking-widest text-white font-semibold">Contato</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#a3644f] shrink-0 mt-0.5" />
              <span>Rua das Palmeiras, 148 — Espírito Santo do Pinhal, SP</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#a3644f] shrink-0" />
              <span>(19) 99234-5678</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#a3644f] shrink-0" />
              <span>Seg–Sáb: 8h–19h</span>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}