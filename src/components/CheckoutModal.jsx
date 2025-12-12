import { useState } from 'react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';
import { formatMoney } from '../utils/format';

const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
  const { processOrder } = useShop();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    payment: 'Efectivo',
    terms: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    setLoading(true);
    try {
      const details = await processOrder(formData);
      onClose();
      onSuccess(details);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Datos de Entrega">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre Completo</label>
          <input 
            required
            type="text" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            placeholder="Juan Pérez"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Dirección de Entrega</label>
          <input 
            required
            type="text" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            placeholder="Calle 123 # 45-67"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Método de Pago</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 p-3 border rounded-xl flex-1 cursor-pointer hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-blue-50">
              <input 
                type="radio" 
                name="payment" 
                value="Efectivo"
                checked={formData.payment === 'Efectivo'}
                onChange={e => setFormData({...formData, payment: e.target.value})}
                className="accent-primary"
              />
              <span>Efectivo</span>
            </label>
            <label className="flex items-center gap-2 p-3 border rounded-xl flex-1 cursor-pointer hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-blue-50">
              <input 
                type="radio" 
                name="payment" 
                value="Transferencia"
                checked={formData.payment === 'Transferencia'}
                onChange={e => setFormData({...formData, payment: e.target.value})}
                className="accent-primary"
              />
              <span>Transferencia</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input 
            id="terms"
            type="checkbox" 
            required
            checked={formData.terms}
            onChange={e => setFormData({...formData, terms: e.target.checked})}
            className="w-5 h-5 accent-primary rounded"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            Acepto el <a href="#" className="text-primary hover:underline">tratamiento de datos personales</a>.
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full btn-primary py-3 text-lg flex justify-center"
        >
          {loading ? 'Procesando...' : 'Confirmar Pedido'}
        </button>
      </form>
    </Modal>
  );
};

export default CheckoutModal;