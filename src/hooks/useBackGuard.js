import { useEffect } from 'react';

export const useBackGuard = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: true }, '');

    const handlePopState = (e) => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
};