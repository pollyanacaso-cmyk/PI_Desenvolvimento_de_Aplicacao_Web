import React from 'react';
import { Award, Users, UserCheck, CalendarCheck } from 'lucide-react';

export function StatsSection() {
  const ESTATISTICAS = [
    {
      numero: '8+',
      rotulo: 'Anos de experiência',
      icone: Award
    },
    {
      numero: '2.400+',
      rotulo: 'Clientes atendidas',
      icone: Users
    },
    {
      numero: '4',
      rotulo: 'Profissionais especializadas',
      icone: UserCheck
    },
    {
      numero: '24h',
      rotulo: 'Agendamento online',
      icone: CalendarCheck
    }
  ];

  return (
    <section className="relative w-full py-6 px-4 sm:px-6 lg:px-8 bg-[#f8f5f2]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ded8] shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ESTATISTICAS.map((stat, index) => {
            const Icone = stat.icone;
            return (
              <div 
                key={index} 
                className={`flex flex-col sm:flex-row items-center text-center sm:text-left gap-3.5 ${
                  index !== 0 ? 'lg:border-l lg:border-[#f0ece9] lg:pl-8' : ''
                }`}
              >
                <div className="p-3 bg-[#a3644f]/10 text-[#a3644f] rounded-2xl flex-shrink-0">
                  <Icone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#3a2e2b] block leading-tight">
                    {stat.numero}
                  </span>
                  <span className="text-xs font-medium text-[#6e635f] mt-0.5 block">
                    {stat.rotulo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;