export function CtaBanner() {
  return (
    <section className="bg-[#b37059] text-white py-20 px-6 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-4xl sm:text-5xl font-serif font-normal leading-tight">
          Pronta para se sentir ainda mais linda?
        </h2>
        <p className="text-base text-white/90 max-w-xl mx-auto font-light">
          Agende seu horário online em poucos cliques e garanta o atendimento da nossa equipe especializada.
        </p>
        <div className="pt-2">
          <button className="bg-white text-[#b37059] font-semibold py-3.5 px-8 rounded-xl shadow-md hover:bg-[#f8f5f2] transition-all text-sm">
            Agendar agora — é rápido e fácil
          </button>
        </div>
      </div>
    </section>
  );
}