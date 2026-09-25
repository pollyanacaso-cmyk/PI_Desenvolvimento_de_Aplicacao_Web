import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../ui/ProductCard';

export function FeaturedProductsSection() {
 {/*array dos produtos */}
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
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Cabelo',
      title: 'Máscara Capilar Intensiva',
      price: 'R$ 94,00',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Cabelo',
      title: 'Óleo de Argan Marrocos',
      price: 'R$ 79,00',
      image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
    },
  ];


  {/* 
  Seção de Produtos da loja do salão. Ela usa o id="produtos" para permitir a rolagem suave a partir do menu principal. 
  O layout ajusta o título e o link no topo com Flexbox e exibe os cartões em uma grade responsiva que se adapta automaticamente.
  O array de produtos é percorrido dinamicamente com a função .map(), 
  repassando os dados de cada item para o componente reutilizável ProductCard.
*/}
  return (
    <section id="produtos" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12"> {/*Usa Flexbox para jogar o título para o lado esquerdo e o link "Ver todos os produtos" para o lado direito */}
        <div>
          <span className="text-xs uppercase tracking-widest text-[#a3644f] font-semibold">Loja</span>
          <h2 className="text-4xl font-serif text-[#2c2825] mt-1">Produtos em Destaque</h2>
        </div>
        <a href="#" className="inline-flex items-center gap-2 text-xs font-semibold text-[#a3644f] hover:underline">
          Ver todos os produtos <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Percorre a lista de produtos simulados (mock data) e envia as informações 
        (category, title, price, image) para dentro do componente ProductCard renderizar na tela. */}
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

// Lista de produtos estática criada para a apresentação do site institucional.
// Se no futuro o salão virar uma loja virtual com carrinho de compras, a gente 
// busca esses dados de um banco de dados (API) e controla o carrinho com useState/Context.
