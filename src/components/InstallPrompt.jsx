import { useEffect, useState } from 'react';

/**
 * InstallPrompt
 * - Escucha `beforeinstallprompt` y muestra un banner discreto
 * - Cuando el usuario acepta, dispara prompt() y oculta el banner.
 */
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault(); // evita el prompt automático
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    // choice.outcome === 'accepted' | 'dismissed'
    setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4">
      <div className="flex-1 text-left">
        <p className="font-semibold">Instala la app</p>
        <p className="text-sm text-gray-500">Agrega esta app a tu dispositivo para acceder más rápido.</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setVisible(false)} className="px-3 py-2 rounded-lg bg-gray-100">Más tarde</button>
        <button onClick={handleInstall} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold">Instalar</button>
      </div>
    </div>
  );
};

export default InstallPrompt;