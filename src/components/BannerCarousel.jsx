import { useRef, useEffect, useState } from 'react';

const BannerCarousel = ({
  images = [
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner1.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner2.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner3.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner4.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner5.webp',
    'https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner6.webp',
  ],
  interval = 3500, // ms entre slides
  transitionMs = 600 // duración de la transición
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const isInteractingRef = useRef(false);

  // slides con clones: [last, ...images, first]
  const slides = [images[images.length - 1], ...images, images[0]];
  const total = slides.length; // images.length + 2

  // index en rango [0..total-1], empezamos en 1 (primer slide real)
  const [index, setIndex] = useState(1);
  const [width, setWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // swipe helpers
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const startTranslate = useRef(0);
  const dragging = useRef(false);

  // calcular ancho slide
  useEffect(() => {
    const calc = () => {
      const w = containerRef.current ? containerRef.current.clientWidth : 0;
      setWidth(w);
      // posicion inicial correcta tras resize
      moveTo(index, false);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  // mover transform al índice (con o sin transición)
  const moveTo = (newIndex, withTransition = true) => {
    const track = trackRef.current;
    if (!track) return;
    if (withTransition) {
      track.style.transition = `transform ${transitionMs}ms ease`;
      setIsTransitioning(true);
    } else {
      track.style.transition = 'none';
      setIsTransitioning(false);
    }
    const x = -newIndex * width;
    track.style.transform = `translateX(${x}px)`;
    currentTranslate.current = x;
  };

  // limpiar timer y (re)iniciar autoplay
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isInteractingRef.current) {
        slideNext();
      }
    }, interval);
  };

  useEffect(() => {
    // iniciar autoplay al montar
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, images.length]);

  // cuando cambia index, mover track con transición
  useEffect(() => {
    moveTo(index, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, width]);

  // manejar fin de transición para "saltos" en clones
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTransitionEnd = () => {
      setIsTransitioning(false);
      // si estamos en clone final (index === total - 1) => saltar a index 1 (sin transición)
      if (index === total - 1) {
        // salto sin transición al primer slide real
        setIndex(1);
        moveTo(1, false);
      }
      // si estamos en clone inicial (index === 0) => saltar a last real (images.length)
      if (index === 0) {
        const lastReal = total - 2;
        setIndex(lastReal);
        moveTo(lastReal, false);
      }
    };

    track.addEventListener('transitionend', onTransitionEnd);
    return () => track.removeEventListener('transitionend', onTransitionEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, width]);

  const slideNext = () => {
    setIndex((prev) => prev + 1);
  };

  const slidePrev = () => {
    setIndex((prev) => prev - 1);
  };

  // ----- Swipe / Drag handlers -----
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    const onPointerDown = (e) => {
      // bloquear si se está en transición
      if (isTransitioning) return;
      dragging.current = true;
      isInteractingRef.current = true;
      startX.current = getClientX(e);
      startTranslate.current = currentTranslate.current;
      // deshabilitar transición para arrastre
      track.style.transition = 'none';
      // stop autoplay while interacting
      if (timerRef.current) clearInterval(timerRef.current);
    };

    const onPointerMove = (e) => {
      if (!dragging.current) return;
      const x = getClientX(e);
      const dx = x - startX.current;
      const newTranslate = startTranslate.current + dx;
      track.style.transform = `translateX(${newTranslate}px)`;
      currentTranslate.current = newTranslate;
    };

    const onPointerUp = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      isInteractingRef.current = false;
      const x = getClientX(e);
      const dx = x - startX.current;
      const threshold = Math.max(40, width * 0.15); // umbral para cambiar slide
      // si desplazamiento supera umbral -> next/prev
      if (dx < -threshold) {
        // swipe left -> next
        setIndex((prev) => prev + 1);
      } else if (dx > threshold) {
        // swipe right -> prev
        setIndex((prev) => prev - 1);
      } else {
        // volver al slide actual
        moveTo(index, true);
      }
      // reiniciar autoplay
      resetTimer();
    };

    // eventos touch + mouse
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    container.addEventListener('touchmove', onPointerMove, { passive: true });
    container.addEventListener('touchend', onPointerUp);
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    return () => {
      container.removeEventListener('touchstart', onPointerDown);
      container.removeEventListener('touchmove', onPointerMove);
      container.removeEventListener('touchend', onPointerUp);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, width, isTransitioning]);

  // Pausar autoplay al hacer hover en desktop; reanudar al salir
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onEnter = () => {
      isInteractingRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
    const onLeave = () => {
      isInteractingRef.current = false;
      resetTimer();
    };
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    return () => {
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render
  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-2xl shadow-lg touch-pan-y"
        aria-hidden={false}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            width: `${total * 100}%`,
            transform: `translateX(${-index * width}px)`,
            transition: `transform ${transitionMs}ms ease`,
          }}
        >
          {slides.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative"
              style={{ width: `${100 / total}%`, minWidth: `${width}px` }}
            >
              <img
                src={src}
                alt={`Banner ${((i + images.length - 1) % images.length) + 1}`}
                className="w-full h-full object-cover min-h-[150px] md:min-h-[300px] block"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 pointer-events-none">
                {/* solo mostrar título visual en la primera copia real (cuando i === 1 real) */}
                {i === 1 && (
                  <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">
                    Las Mejores Hamburguesas
                  </h2>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* indicadores (opcional) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => {
          // calcular el índice actual real (1..images.length) y map a 0..images.length-1
          const realIndex = ((index - 1 + images.length) % images.length);
          return (
            <button
              key={i}
              onClick={() => setIndex(i + 1)}
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