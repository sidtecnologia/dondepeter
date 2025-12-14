import { useRef, useEffect, useState } from 'react';

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

  // slides con clones: [last, ...images, first]
  const slides = images && images.length > 0 ? [images[images.length - 1], ...images, images[0]] : [];
  const totalSlides = slides.length; // images.length + 2

  // índice en el track (empieza en 1 -> primer slide real)
  const [index, setIndex] = useState(1);
  const indexRef = useRef(index);
  indexRef.current = index;

  // ancho en px de cada slide (medido)
  const [width, setWidth] = useState(0);

  // control de transición para evitar "doble-move"
  const skipTransitionRef = useRef(false);
  const isTransitioningRef = useRef(false);

  // scheduler en lugar de interval
  const timeoutRef = useRef(null);
  const isInteractingRef = useRef(false);

  // dragging
  const dragging = useRef(false);
  const startX = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);

  // MEDIR ancho usando ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 0;
      setWidth(w);
      // ajustar track inmediatamente cuando cambia ancho
      if (trackRef.current) {
        trackRef.current.style.width = `${(totalSlides) * w}px`;
        // posicionar en el index actual sin transición
        trackRef.current.style.transition = 'none';
        const x = -indexRef.current * w;
        trackRef.current.style.transform = `translateX(${x}px)`;
        currentTranslate.current = x;
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        trackRef.current.offsetHeight;
      }
    });

    ro.observe(container);

    return () => {
      ro.disconnect();
    };
    // totalSlides puede cambiar si images cambian
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides]);

  // Funciones para mover el track
  const moveWithTransition = (idx) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = `transform ${transitionMs}ms ease`;
    const x = -idx * width;
    trackRef.current.style.transform = `translateX(${x}px)`;
    currentTranslate.current = x;
    isTransitioningRef.current = true;
  };

  const moveWithoutTransition = (idx) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = 'none';
    const x = -idx * width;
    trackRef.current.style.transform = `translateX(${x}px)`;
    currentTranslate.current = x;
    isTransitioningRef.current = false;
  };

  // cuando cambia index, movemos (salto sin transición si skipTransitionRef)
  useEffect(() => {
    if (!trackRef.current || width === 0) return;
    if (skipTransitionRef.current) {
      moveWithoutTransition(index);
      skipTransitionRef.current = false;
    } else {
      moveWithTransition(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, width]);

  // Listener de transitionend para manejar clones (loop)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTransitionEnd = () => {
      isTransitioningRef.current = false;
      // Si estamos en clone final -> saltar a primer real (1)
      if (indexRef.current === totalSlides - 1) {
        skipTransitionRef.current = true;
        setIndex(1);
      }
      // Si estamos en clone inicial (0) -> saltar a último real (totalSlides-2)
      if (indexRef.current === 0) {
        const lastReal = totalSlides - 2;
        skipTransitionRef.current = true;
        setIndex(lastReal);
      }
      // programar siguiente slide luego de que la transición finalizó
      scheduleNext();
    };

    track.addEventListener('transitionend', onTransitionEnd);
    return () => track.removeEventListener('transitionend', onTransitionEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides, width]);

  // Scheduler: usar setTimeout controlado para evitar acumulación y problemas al dejar la pestaña inactiva
  const clearScheduled = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleNext = () => {
    clearScheduled();
    // No programar si ancho 0 o sin slides
    if (width === 0 || totalSlides === 0) return;
    // No programar si la página está oculta
    if (typeof document !== 'undefined' && document.hidden) return;
    timeoutRef.current = setTimeout(() => {
      // Si estamos en transición o interactuando, reprogramar
      if (isTransitioningRef.current || isInteractingRef.current || dragging.current) {
        scheduleNext();
        return;
      }
      // protección para que index no crezca indefinidamente (en casos extremos)
      if (indexRef.current > 1000000) {
        setIndex(1);
      } else {
        setIndex((prev) => prev + 1);
      }
    }, interval);
  };

  // iniciar scheduler al montar y cuando cambie width o slides
  useEffect(() => {
    // clear any previous
    clearScheduled();
    // schedule first
    scheduleNext();

    // Manejar visibilitychange para pausar/reanudar scheduler
    const onVisibility = () => {
      if (document.hidden) {
        clearScheduled();
      } else {
        // re-posicionar correctamente (por si quedamos en un clone) y reprogramar
        if (trackRef.current) {
          moveWithoutTransition(indexRef.current);
        }
        scheduleNext();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearScheduled();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, totalSlides, interval]);

  // Swipe / Drag handlers
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    const onStart = (e) => {
      if (isTransitioningRef.current) return;
      dragging.current = true;
      isInteractingRef.current = true;
      startX.current = getClientX(e);
      startTranslate.current = currentTranslate.current;
      track.style.transition = 'none';
      clearScheduled(); // pause autoplay
    };

    const onMove = (e) => {
      if (!dragging.current) return;
      const x = getClientX(e);
      const dx = x - startX.current;
      const newTranslate = startTranslate.current + dx;
      track.style.transform = `translateX(${newTranslate}px)`;
      currentTranslate.current = newTranslate;
    };

    const onEnd = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      isInteractingRef.current = false;
      const x = getClientX(e);
      const dx = x - startX.current;
      const threshold = Math.max(40, width * 0.15);
      if (dx < -threshold) {
        setIndex((prev) => prev + 1);
      } else if (dx > threshold) {
        setIndex((prev) => prev - 1);
      } else {
        // restaurar al índice actual
        moveWithTransition(indexRef.current);
      }
      // reanudar scheduler
      scheduleNext();
    };

    // add listeners
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, interval, totalSlides]);

  // pause on hover for desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onEnter = () => {
      isInteractingRef.current = true;
      clearScheduled();
    };
    const onLeave = () => {
      isInteractingRef.current = false;
      scheduleNext();
    };
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    return () => {
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-2xl shadow-lg"
        aria-hidden={false}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            width: width > 0 ? `${totalSlides * width}px` : 'auto',
            transform: `translateX(${-index * width}px)`,
            transition: `transform ${transitionMs}ms ease`
          }}
        >
          {slides.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative"
              style={{ width: width > 0 ? `${width}px` : '100%', minWidth: width > 0 ? `${width}px` : '100%' }}
            >
              <img
                src={src}
                alt={`Banner ${((i + images.length - 1) % images.length) + 1}`}
                className="w-full h-full object-cover min-h-[150px] md:min-h-[300px] block"
                loading="lazy"
                draggable="false"
                onDragStart={(e) => e.preventDefault()}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 pointer-events-none">
                {i === 1 && (
                  <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">Las Mejores Hamburguesas</h2>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => {
          const realIndex = ((index - 1 + images.length) % images.length);
          return (
            <button
              key={i}
              onClick={() => {
                setIndex(i + 1);
                scheduleNext();
              }}
              className={`w-2 h-2 rounded-full transition-all ${realIndex === i ? 'bg-white w-4' : 'bg-white/60'}`}
              aria-label={`Ir al banner ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BannerCarousel;