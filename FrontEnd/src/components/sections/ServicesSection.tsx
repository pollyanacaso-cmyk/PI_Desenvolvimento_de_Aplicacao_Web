import { ServiceCard } from '../ui/ServiceCard';

export function ServicesSection() {
  const services = [
    {
      title: 'Cabelo',
      description: 'Cortes, coloração, hidratação e muito mais',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Unhas',
      description: 'Manicure, pedicure e nail art profissional',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Sobrancelhas',
      description: 'Design, henna e micropigmentação',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#a3644f] font-semibold">O que oferecemos</span>
        <h2 className="text-4xl font-serif text-[#2c2825]">Nossos Serviços</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <ServiceCard 
            key={index} 
            title={service.title} 
            description={service.description} 
            image={service.image} 
          />
        ))}
      </div>
    </section>
  );
}