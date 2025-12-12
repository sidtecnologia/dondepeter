import { useEffect, useState } from 'react';

/**
 * InstallPrompt mejorado:
 * - Escucha 'beforeinstallprompt' y también el evento custom 'deferredPromptReady' (empaquetado desde main.jsx)
 * - Además revisa window.deferredPrompt al montar por si ya fue capturado.
 */
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      // guarda prompt y muestra banner
      window.deferredPrompt = e;
      setDeferredPrompt(e);
      setVisible(true);
    };

    const onDeferredReady = () => {
      // main.jsx puede haber guardado el event en window.deferredPrompt
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('deferredPromptReady', onDeferredReady);

    // si el evento ya fue capturado por main.jsx antes de montar
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('deferredPromptReady', onDeferredReady);
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (!promptEvent) return;
    try {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setVisible(false);
      // borrar referencia
      window.deferredPrompt = null;
      setDeferredPrompt(null);
    } catch (e) {
      // no crítico
      console.warn('Install prompt error', e);
      setVisible(false);
    }
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