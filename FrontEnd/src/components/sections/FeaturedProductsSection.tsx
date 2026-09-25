import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../ui/ProductCard';

export function FeaturedProductsSection() {
  const products = [
    {
      category: 'Cabelo',
      title: 'Shampoo Nutritivo Premium',
      price: 'R$ 62,00',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Cabelo',
      title: 'Condicionador Reparador',
      price: 'R$ 55,00',
      image: 'https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Cabelo',
      title: 'Máscara Capilar Intensiva',
      price: 'R$ 94,00',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Cabelo',
      title: 'Óleo de Argan Marrocos',
      price: 'R$ 79,00',
      image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#a3644f] font-semibold">Loja</span>
          <h2 className="text-4xl font-serif text-[#2c2825] mt-1">Produtos em Destaque</h2>
        </div>
        <a href="#" className="inline-flex items-center gap-2 text-xs font-semibold text-[#a3644f] hover:underline">
          Ver todos os produtos <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard 
            key={index} 
            category={product.category} 
            title={product.title} 
            price={product.price} 
            image={product.image} 
          />
        ))}
      </div>
    </section>
  );
}