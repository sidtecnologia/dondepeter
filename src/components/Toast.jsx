import { useEffect } from 'react';
import { useShop } from '../context/ShopContext';

/**
 * Toast container que consume toasts desde ShopContext
 * - Muestra toasts en la esquina superior derecha (stack)
 * - Se eliminan automáticamente (el propio ShopContext programa el borrado)
 */
const Toasts = () => {
  const { toasts, removeToast } = useShop();

  useEffect(() => {
    // por si queremos realizar efectos o accesibilidad
  }, [toasts]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="max-w-sm w-full bg-white border border-gray-200 shadow-md rounded-xl px-4 py-3 flex items-center gap-3 animate-slide-in"
          role="status"
          aria-live="polite"
        >
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm text-gray-800">{t.title || '¡Listo!'}</p>
            <p className="text-xs text-gray-500">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toasts;