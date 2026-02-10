import { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

const Toasts = () => {
  const { toasts, removeToast } = useShop();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-md">
    {toasts.map((t) => (
      <div
      key={t.id}
      className="bg-gray-900/95 backdrop-blur-md text-white shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
      role="status"
      aria-live="polite"
      >
      <div className="flex-shrink-0">
      {t.type === 'error' ? (
        <XCircle className="text-red-400" size={20} />
      ) : t.type === 'warning' ? (
        <AlertCircle className="text-yellow-400" size={20} />
      ) : (
        <CheckCircle2 className="text-green-400" size={20} />
      )}
      </div>

      <div className="flex-1 text-left">
      <p className="text-sm font-medium leading-tight">{t.message}</p>
      </div>

      <button
      onClick={() => removeToast(t.id)}
      className="p-1 hover:bg-white/10 rounded-full transition-colors"
      aria-label="Cerrar notificación"
      >
      <X size={16} className="text-gray-400" />
      </button>
      </div>
    ))}
    </div>
  );
};

export default Toasts;
