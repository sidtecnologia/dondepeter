import { Trash2, ArrowRight } from 'lucide-react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';
import { formatMoney } from '../utils/format';

const CartModal = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateCartQty, removeFromCart } = useShop();

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tu Pedido">
      {cart.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>Tu carrito está vacío.</p>
          <button onClick={onClose} className="mt-4 text-primary font-semibold">Ver menú</button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl">
                <img 
                  src={item.image || '/img/placeholder.png'} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <p className="text-primary font-semibold">${formatMoney(item.price * item.qty)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateCartQty(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold">{item.qty}</span>
                  <button 
                    onClick={() => updateCartQty(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold mb-6">
              <span>Total:</span>
              <span>${formatMoney(total)}</span>
            </div>
            <button 
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              <span>Continuar Compra</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CartModal;