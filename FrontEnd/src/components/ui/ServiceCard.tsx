import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  href?: string;
}

export function ServiceCard({ title, description, image, href = '#' }: ServiceCardProps) {
  return (
    <div className="relative group rounded-2xl overflow-hidden h-96 shadow-sm flex flex-col justify-end p-8">
      <img 
        src={image} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative z-10 text-white space-y-2">
        <h3 className="text-2xl font-serif font-normal">{title}</h3>
        <p className="text-xs text-[#e6ddd7]">{description}</p>
        <a href={href} className="inline-flex items-center gap-2 text-xs font-semibold text-white group-hover:text-[#f3e3dd] pt-2 transition-colors">
          Ver serviços <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}