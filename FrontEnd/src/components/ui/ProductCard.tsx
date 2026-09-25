interface ProductCardProps {
  category: string;
  title: string;
  price: string;
  image: string;
}

export function ProductCard({ category, title, price, image }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#eee6e2] shadow-sm hover:shadow-md transition-shadow">
      <div className="h-64 overflow-hidden bg-[#f8f5f2]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-[#a3644f] font-bold">{category}</span>
        <h4 className="font-semibold text-sm text-[#2c2825]">{title}</h4>
        <p className="text-base font-serif text-[#a3644f] font-normal pt-1">{price}</p>
      </div>
    </div>
  );
}