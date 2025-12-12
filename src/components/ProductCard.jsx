import { Plus } from 'lucide-react';
import { formatMoney } from '../utils/format';

const ProductCard = ({ product, onClick }) => {
  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-transparent hover:border-gray-100 relative ${isOutOfStock ? 'opacity-70' : ''}`}
      onClick={() => onClick(product)}
    >
      {product.bestSeller && (
        <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md z-10 shadow-sm">
          Más Vendido
        </span>
      )}

      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
          <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold shadow-lg transform -rotate-12">AGOTADO</span>
        </div>
      )}

      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image?.[0] || '/img/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <Plus size={20} className="text-primary" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-1 text-lg mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3 h-10 leading-snug">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">${formatMoney(product.price)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;