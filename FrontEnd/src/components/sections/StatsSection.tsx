export function StatsSection() {
  const stats = [
    { value: '8+', label: 'Anos de experiência' },
    { value: '2.400+', label: 'Clientes atendidas' },
    { value: '4', label: 'Profissionais especializadas' },
    { value: '4,9', label: 'Avaliação média' },
  ];

  return (
    <section className="bg-[#f2ece8] py-10 border-b border-[#e6ddd7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <span className="text-3xl sm:text-4xl font-serif text-[#a3644f] font-normal block">
              {stat.value}
            </span>
            <span className="text-xs sm:text-sm text-[#7a6f6a] font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}