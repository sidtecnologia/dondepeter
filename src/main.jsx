import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // <--- CORRECCIÓN: Apuntando directamente al archivo en src

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Service Worker registration for PWA (only in production and if supported)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service worker registrado:', reg);
      })
      .catch(err => {
        console.warn('Error registrando service worker:', err);
      });
  });
}


window.addEventListener('beforeinstallprompt', (e) => {
  // prevent the automatic mini-infobar on mobile
  e.preventDefault();
  window.deferredPrompt = e;
  // dispatch custom event to notify listeners (InstallPrompt)
  window.dispatchEvent(new Event('deferredPromptReady'));
});