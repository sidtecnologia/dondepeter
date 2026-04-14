import { useState } from 'react';
import Modal from './ui/Modal';
import { Copy, Check } from 'lucide-react';
import { formatMoney } from '../utils/format';

const NEQUI_QR_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png';
const NEQUI_NUMBER = '3227671829';
const DELIVERY_COST = 4000;

const TransferPaymentModal = ({ isOpen, onClose, orderDetails, onConfirm, loading }) => {
  const [copied, setCopied] = useState(false);
  const [includeDelivery, setIncludeDelivery] = useState(false);

  if (!orderDetails) return null;

  const totalToPay = includeDelivery ? orderDetails.total + DELIVERY_COST : orderDetails.total;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(NEQUI_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = NEQUI_NUMBER;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Información de Pago">
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Escanea el QR de Nequi</p>
          <img
            src={NEQUI_QR_URL}
            alt="QR Nequi"
            className="w-48 h-48 rounded-2xl border border-gray-200 shadow object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Número de cuenta Nequi</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-mono text-gray-800 text-base tracking-widest select-all">
              {NEQUI_NUMBER}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Subtotal pedido</span>
            <span className="font-semibold text-gray-800">${formatMoney(orderDetails.total)}</span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={includeDelivery}
              onChange={e => setIncludeDelivery(e.target.checked)}
              className="w-5 h-5 accent-primary rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">¿Incluir pago de domicilio?</p>
              <p className="text-xs text-gray-400">+${formatMoney(DELIVERY_COST)} — ¿o pagas al recibir?</p>
            </div>
          </label>

          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-bold text-gray-800">Total a transferir</span>
            <span className="text-xl font-bold text-primary">${formatMoney(totalToPay)}</span>
          </div>
        </div>

        <button
          onClick={() => onConfirm(includeDelivery, totalToPay)}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-6 h-6" />
          {loading ? 'Procesando...' : 'Enviar comprobante'}
        </button>
      </div>
    </Modal>
  );
};

export default TransferPaymentModal;