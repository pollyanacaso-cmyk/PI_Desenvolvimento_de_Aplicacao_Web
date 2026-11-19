import { MapPin, Clock } from 'lucide-react';

const LINK_GOOGLE_MAPS =
  'https://www.google.com/maps/search/?api=1&query=Ke+Bella+Esp%C3%ADrito+Santo+do+Pinhal+SP';

export function Footer() {
  return (
    <footer className="bg-[#2A211F] text-white/80 border-t border-white/10 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-center">

        {/* LOGO & SOBRE */}
        <div className="space-y-4 flex flex-col items-center">
          <span className="font-serif italic text-3xl text-white block">
            Ke Bella
          </span>
          <p className="text-xs text-white/60 leading-relaxed max-w-xs">
            Espaço de beleza e bem-estar dedicado a realçar sua essência com cuidado e atendimento exclusivo.
          </p>
        </div>

        {/* HORÁRIO DE FUNCIONAMENTO */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg text-white font-medium">Horários</h4>
          <div className="text-xs space-y-2 text-white/70">
            <p className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-[#a3644f]" />
              <span>Segunda a Sábado: 08:00 – 19:00</span>
            </p>
            <p className="text-white/50">Domingo: Fechado</p>
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg text-white font-medium">Endereço</h4>
          <div className="text-xs space-y-2 text-white/70">
            <a
              href={LINK_GOOGLE_MAPS}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver localização no Google Maps"
              className="flex items-center justify-center gap-2 hover:text-white hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#a3644f]" />
              <span>Espírito Santo do Pinhal, SP</span>
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
        <p>© {new Date().getFullYear()} Ke Bella. Todos os direitos reservados.</p>
        <p>Desenvolvido com excelência.</p>
      </div>
    </footer>
  );
}

export default Footer;
