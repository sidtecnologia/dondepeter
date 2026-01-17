import { useState } from 'react';
import Modal from './ui/Modal';
import { CheckCircle } from 'lucide-react';
import { formatMoney } from '../utils/format';
import { useShop } from '../context/ShopContext';

const SuccessModal = ({ isOpen, onClose, orderDetails }) => {
  const { confirmOrder } = useShop();
  const [loading, setLoading] = useState(false);

  if (!orderDetails) return null;

  const handleWhatsApp = async () => {
    const whatsappNumber = '573227671829';
    let message = `Hola mi nombre es ${orderDetails.name}. He realizado un pedido para la dirección ${orderDetails.address}. Detalles: `;
    orderDetails.items.forEach(item => {
      const obsText = item.observation ? ` (${item.observation})` : '';
      message += `---- ${item.name} x${item.qty}${obsText} = $${formatMoney(item.price * item.qty)} `;
    });
    if (orderDetails.observation) {
      message += `Observaciones: ${orderDetails.observation} `;
    }
    message += `Total: $${formatMoney(orderDetails.total)}`;

    const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const win = window.open('about:blank', '_blank', 'noopener,noreferrer');
    try {
      setLoading(true);
      await confirmOrder(orderDetails);
      if (win) {
        try {
          win.location.href = link;
        } catch (e) {
          window.open(link, '_blank', 'noopener,noreferrer');
        }
      } else {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
      if (onClose) onClose();
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      if (win) {
        try { win.close(); } catch (e) {}
      }
      console.error('No se pudo confirmar el pedido antes de enviar WhatsApp:', err);
      alert('No se pudo procesar el pedido. Por favor intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¡Pedido Recibido!">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="text-green-500 w-20 h-20 animate-bounce" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">¡Tu comida está casi lista!</h3>
          <p className="text-gray-500 mt-2">Confirma el pedido por WhatsApp para proceder con el despacho.</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl text-left">
          <p className="text-lg font-bold mb-2">Total a pagar: <span className="text-primary">${formatMoney(orderDetails.total)}</span></p>
          {orderDetails.observation ? (
            <div className="mt-2">
              <p className="font-semibold text-sm text-gray-700">Observaciones del pedido:</p>
              <p className="text-sm text-gray-600">{orderDetails.observation}</p>
            </div>
          ) : null}
        </div>

        <button
          onClick={handleWhatsApp}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-6 h-6" />
          {loading ? 'Procesando...' : 'Confirmar por WhatsApp'}
        </button>

        <button onClick={onClose} className="text-gray-400 text-sm hover:text-gray-600 underline">
          Cancelar pedido y volver al menú
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;