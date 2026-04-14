import { useEffect } from 'react';

const ExitConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl">👋</div>
          <h3 className="text-lg font-bold text-gray-800">¿Salir de la aplicación?</h3>
          <p className="text-sm text-gray-500">Si sales ahora perderás tu carrito y el progreso actual.</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Quedarme
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmDialog;