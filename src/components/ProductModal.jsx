import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';
import { formatMoney } from '../utils/format';

const ProductModal = ({ product, isOpen, onClose }) => {
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [observation, setObservation] = useState('');
  const { addToCart } = useShop();

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setImgIndex(0);
      setObservation('');
    }
  }, [isOpen]);

  if (!product) return null;

  const handleAddToCart = () => {
    // addToCart ahora acepta tercer parámetro observation
    addToCart(product, qty, observation?.trim());
    onClose();
  };

  const images = product.image && product.image.length > 0 ? product.image : ['/img/placeholder.png'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles">
      <div className="space-y-6">
        {/* Carousel Simple */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
          <img
            src={images[imgIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === imgIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <p className="text-2xl font-bold text-primary mt-1">${formatMoney(product.price)}</p>
          <p className="text-gray-600 mt-3 leading-relaxed">{product.description}</p>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Observaciones (opcional)</label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ej: Sin cebolla, extra picante, dejar en portería..."
            rows={3}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-3 hover:bg-white rounded-md transition shadow-sm"
              aria-label="Disminuir cantidad"
            >
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-bold text-lg">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="p-3 hover:bg-white rounded-md transition shadow-sm"
              aria-label="Aumentar cantidad"
            >
              <Plus size={18} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.stock || product.stock < qty}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            <span>{product.stock >= qty ? 'Agregar' : 'Sin Stock'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;