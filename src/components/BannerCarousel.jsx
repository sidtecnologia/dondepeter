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
  const realCount = images.length;

  // índice en el track (empieza en 1 -> primer slide real)
  const [index, setIndex] = useState(1);
  const indexRef = useRef(index);
  indexRef.current = index;

  // ancho en px de cada slide
  const [width, setWidth] = useState(0);

  // refs para controlar estado
  const isTransitioningRef = useRef(false);
  const skipTransitionRef = useRef(false);
  const timeoutRef = useRef(null);
  const isInteractingRef = useRef(false);
  const dragging = useRef(false);

  // dragging helpers
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
      if (trackRef.current) {
        trackRef.current.style.width = `${totalSlides * w}px`;
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

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides]);

  // Mover track con/sin transición
  const moveTo = (idx, withTransition = true) => {
    const track = trackRef.current;
    if (!track) return;
    if (withTransition) {
      track.style.transition = `transform ${transitionMs}ms ease`;
      isTransitioningRef.current = true;
    } else {
      track.style.transition = 'none';
      isTransitioningRef.current = false;
    }
    const x = -idx * width;
    track.style.transform = `translateX(${x}px)`;
    currentTranslate.current = x;
  };

  // Cuando cambia index, mover y programar siguiente slide
  useEffect(() => {
    if (!trackRef.current || width === 0 || totalSlides === 0) return;

    if (skipTransitionRef.current) {
      // salto sin transición (cuando ajustamos clones)
      moveTo(index, false);
      skipTransitionRef.current = false;
    } else {
      moveTo(index, true);
    }

    // limpiar timeout previo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // programar siguiente slide (si no interactuando y pestaña visible)
    const schedule = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      timeoutRef.current = setTimeout(() => {
        // no avanzar si el usuario está interactuando o estamos en transición
        if (isInteractingRef.current || isTransitioningRef.current || dragging.current) {
          // reprogramar de nuevo para revisar más tarde
          schedule();
          return;
        }
        setIndex((prev) => prev + 1);
      }, interval);
    };

    schedule();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, width, totalSlides, interval]);

  // transitionend: manejar clones para loop infinito y reprogramar
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTransitionEnd = () => {
      isTransitioningRef.current = false;
      // Si estamos en clone final -> saltar a primer real (index = 1)
      if (indexRef.current === totalSlides - 1) {
        skipTransitionRef.current = true;
        setIndex(1);
        return;
      }
      // Si estamos en clone inicial -> saltar a último real
      if (indexRef.current === 0) {
        skipTransitionRef.current = true;
        setIndex(totalSlides - 2);
        return;
      }
      // Si transición terminó en un slide real, nada más que hacer (el efecto useEffect de index programará el siguiente timeout)
    };

    track.addEventListener('transitionend', onTransitionEnd);
    return () => track.removeEventListener('transitionend', onTransitionEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides]);

  // Swipe / drag handlers
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
      // pause scheduled autoplay
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
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
        // devolver al slide actual
        moveTo(indexRef.current, true);
      }
    };

    // eventos touch + mouse
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
  }, [width, totalSlides]);

  // pause/resume on hover (desktop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onEnter = () => {
      isInteractingRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    const onLeave = () => {
      isInteractingRef.current = false;
      // trigger next scheduling immediately after hover
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // force re-schedule by nudging indexRef (use setIndex to re-run effect)
      if (!isTransitioningRef.current) {
        // schedule next slide by setting a timeout via effect on index; trigger by setting same index
        setIndex((prev) => prev);
      }
    };

    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    return () => {
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pause scheduling when page hidden, resume when visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // when visible again, ensure track is positioned correctly and schedule next
        if (trackRef.current) moveTo(indexRef.current, false);
        // schedule next via index effect by nudging index (set to same to re-run)
        setIndex((prev) => prev);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
      const realIndex = ((index - 1 + realCount) % realCount);
      return (
        <button
        key={i}
        onClick={() => {
          setIndex(i + 1);
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
