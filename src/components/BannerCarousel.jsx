import { useRef, useEffect, useState, useMemo, useCallback } from 'react';

const BannerCarousel = ({
  images = [
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner1.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner2.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner3.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner4.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner5.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner6.webp'
  ],
  interval = 3500,
  transitionMs = 600
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // 1. OPTIMIZACIÓN: Memoizar slides para evitar re-cálculos innecesarios
  const slides = useMemo(() => {
    if (!images || images.length === 0) return [];
    return [images[images.length - 1], ...images, images[0]];
  }, [images]);

  const totalSlides = slides.length;
  const realCount = images.length;

  const [index, setIndex] = useState(1);
  const indexRef = useRef(index);
  indexRef.current = index; // Mantener ref actualizado para event listeners

  const [width, setWidth] = useState(0);

  // Refs de control
  const isTransitioningRef = useRef(false);
  const skipTransitionRef = useRef(false);
  const timeoutRef = useRef(null);
  const isInteractingRef = useRef(false); // Hover o Drag activo
  const dragging = useRef(false);

  // Refs para Drag
  const startX = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);

  // Helper para mover el track
  // 2. OPTIMIZACIÓN: Usar translate3d para activar aceleración por hardware (GPU)
  const moveTo = useCallback((idx, withTransition = true) => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transition = withTransition ? `transform ${transitionMs}ms ease` : 'none';
    isTransitioningRef.current = withTransition;

    const x = -idx * width;
    track.style.transform = `translate3d(${x}px, 0, 0)`; // translate3d es más fluido en móviles
    currentTranslate.current = x;
  }, [width, transitionMs]);

  // Helper centralizado para el Timer
  const startTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Solo iniciamos si no hay interacción humana activa
    if (!isInteractingRef.current && !dragging.current) {
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, interval);
    }
  }, [interval]);

  const stopTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Efecto 1: Medir ancho (ResizeObserver)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 0;
      setWidth(w);
      // Ajuste inmediato sin transición al redimensionar
      if (trackRef.current) {
        trackRef.current.style.width = `${totalSlides * w}px`;
        moveTo(indexRef.current, false);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [totalSlides, moveTo]);

  // Efecto 2: Control del Movimiento y el Ciclo de AutoPlay
  useEffect(() => {
    if (width === 0 || totalSlides === 0) return;

    // Ejecutar movimiento visual
    if (skipTransitionRef.current) {
      moveTo(index, false);
      skipTransitionRef.current = false;
    } else {
      moveTo(index, true);
    }

    // Reiniciar timer automáticamente después de cada cambio de slide
    startTimer();

    return stopTimer; // Limpieza al desmontar o cambiar index
  }, [index, width, totalSlides, startTimer, stopTimer, moveTo]);

  // Efecto 3: Manejar el Loop Infinito (TransitionEnd)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTransitionEnd = () => {
      isTransitioningRef.current = false;
      // Loop final -> principio
      if (indexRef.current === totalSlides - 1) {
        skipTransitionRef.current = true;
        setIndex(1);
      }
      // Loop principio -> final
      else if (indexRef.current === 0) {
        skipTransitionRef.current = true;
        setIndex(totalSlides - 2);
      }
    };

    track.addEventListener('transitionend', onTransitionEnd);
    return () => track.removeEventListener('transitionend', onTransitionEnd);
  }, [totalSlides]);

  // Efecto 4: Gestos Touch y Mouse (Drag)
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    const onStart = (e) => {
      if (isTransitioningRef.current) return;
      stopTimer(); // Pausa inmediata
      dragging.current = true;
      isInteractingRef.current = true;
      startX.current = getClientX(e);
      startTranslate.current = currentTranslate.current;
      track.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!dragging.current) return;
      const x = getClientX(e);
      const dx = x - startX.current;
      const newTranslate = startTranslate.current + dx;
      track.style.transform = `translate3d(${newTranslate}px, 0, 0)`;
      currentTranslate.current = newTranslate;
    };

    const onEnd = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      // Nota: Mantenemos isInteractingRef en true un momento si es necesario,
      // pero aquí lo soltamos para reanudar el timer via useEffect o mouseleave
      isInteractingRef.current = false;

      const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX); // Fix para touchend
      const dx = x - startX.current;
      const threshold = Math.max(40, width * 0.15);

      if (dx < -threshold) {
        setIndex((prev) => prev + 1);
      } else if (dx > threshold) {
        setIndex((prev) => prev - 1);
      } else {
        moveTo(indexRef.current, true); // Regresar al sitio si no fue suficiente swipe
        startTimer(); // Reanudar timer si no cambió de slide
      }
    };

    container.addEventListener('touchstart', onStart, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: true });
    container.addEventListener('touchend', onEnd);
    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    return () => {
      container.removeEventListener('touchstart', onStart);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onEnd);
      container.removeEventListener('mousedown', onStart);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
    };
  }, [width, totalSlides, startTimer, stopTimer, moveTo]);

  // Efecto 5: Hover y Visibilidad
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onEnter = () => {
      isInteractingRef.current = true;
      stopTimer();
    };

    const onLeave = () => {
      isInteractingRef.current = false;
      startTimer();
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopTimer();
      else startTimer();
    };

      container.addEventListener('mouseenter', onEnter);
      container.addEventListener('mouseleave', onLeave);
      document.addEventListener('visibilitychange', onVisibilityChange);

      return () => {
        container.removeEventListener('mouseenter', onEnter);
        container.removeEventListener('mouseleave', onLeave);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        stopTimer();
      };
  }, [startTimer, stopTimer]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full relative group">
    <div
    ref={containerRef}
    className="w-full overflow-hidden rounded-2xl shadow-lg touch-pan-y"
    // touch-pan-y permite scroll vertical de la página sin bloquear el swipe horizontal
    role="region"
    aria-roledescription="carousel"
    >
    <div
    ref={trackRef}
    className="flex will-change-transform" // Optimización CSS para el navegador
    style={{
      width: width > 0 ? `${totalSlides * width}px` : 'auto',
      transform: `translate3d(${-index * width}px, 0, 0)`,
    }}
    >
    {slides.map((src, i) => (
      <div
      key={i}
      className="flex-shrink-0 relative"
      style={{ width: width > 0 ? `${width}px` : '100%' }}
      aria-hidden={i !== index} // Accesibilidad
      >
      <img
      src={src}
      alt={`Banner ${((i + images.length - 1) % images.length) + 1}`}
      className="w-full h-full object-cover min-h-[150px] md:min-h-[300px] block select-none"
      loading="lazy"
      draggable="false"
      />
      {/* Ejemplo de contenido sobre la imagen (solo en slide original 1) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 pointer-events-none">
      {/* Nota: Ajusté la lógica para que coincida con la imagen 1 real */}
      {src === images[0] && (
        <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg"></h2>
      )}
      </div>
      </div>
    ))}
    </div>
    </div>

    {/* Indicadores */}
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
    {images.map((_, i) => {
      const realIndex = (index - 1 + realCount) % realCount;
      return (
        <button
        key={i}
        onClick={(e) => {
          e.stopPropagation(); // Evitar triggers raros
          setIndex(i + 1);
        }}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          realIndex === i ? 'bg-white w-4' : 'bg-white/60 hover:bg-white/80'
        }`}
        aria-label={`Ir al banner ${i + 1}`}
        aria-current={realIndex === i ? 'true' : 'false'}
        />
      );
    })}
    </div>
    </div>
  );
};

export default BannerCarousel;
