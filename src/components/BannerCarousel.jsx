import { useRef, useEffect, useState } from 'react';


const BannerCarousel = ({ images = [], speed = 40 }) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const [ready, setReady] = useState(false);

  // No render si no hay imágenes
  if (!images || images.length === 0) return null;

  // usamos una copia triplicada para dar continuidad
  const tripled = [...images, ...images, ...images];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let mounted = true;

    const recalc = () => {
      // iniciar en la copia del medio
      const slideWidth = el.clientWidth;
      el.scrollLeft = slideWidth * images.length;
      setReady(true);
    };

    recalc();

    const handleResize = () => {
      // recalcula posición base al redimensionar
      recalc();
    };

    window.addEventListener('resize', handleResize);

    // pointer handlers (drag)
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      lastTsRef.current = null; // reiniciar animación delta
      startXRef.current = e.clientX ?? e.touches?.[0]?.clientX;
      startScrollRef.current = el.scrollLeft;
      el.style.scrollSnapType = 'none'; // permitir arrastre libre
      // cancelar animación mientras arrastra
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const dx = startXRef.current - x;
      el.scrollLeft = startScrollRef.current + dx;
      // mantener continuidad manualmente si se arrastra al límite
      const slideW = el.clientWidth;
      const totalSlides = tripled.length;
      const fullWidth = slideW * totalSlides;
      // si pasa un umbral, ajusta al centro
      if (el.scrollLeft <= slideW * 0.5) {
        el.scrollLeft += slideW * images.length;
        startScrollRef.current = el.scrollLeft;
      } else if (el.scrollLeft >= slideW * (images.length * 2 + 0.5)) {
        el.scrollLeft -= slideW * images.length;
        startScrollRef.current = el.scrollLeft;
      }
    };

    const onPointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      el.style.scrollSnapType = 'x mandatory';
      lastTsRef.current = null;
      // reiniciar animación
      rafRef.current = requestAnimationFrame(step);
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    el.addEventListener('touchstart', onPointerDown, { passive: true });
    el.addEventListener('touchmove', onPointerMove, { passive: true });
    el.addEventListener('touchend', onPointerUp);

    // animación perpetua
    const pxPerMs = speed / 1000; // px por ms

    const step = (ts) => {
      if (!mounted) return;
      if (isDraggingRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      if (!lastTsRef.current) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;

      el.scrollLeft += pxPerMs * delta;

      const slideW = el.clientWidth;
      // límites para resetear (cuando llegamos a la copia final)
      const leftReset = slideW * images.length * 0.5;
      const rightReset = slideW * images.length * 2.5;

      if (el.scrollLeft >= rightReset) {
        // retroceder exactamente images.length slides para mantener continuidad
        el.scrollLeft -= slideW * images.length;
      } else if (el.scrollLeft <= leftReset) {
        el.scrollLeft += slideW * images.length;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    // comenzar animación
    rafRef.current = requestAnimationFrame(step);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('touchstart', onPointerDown);
      el.removeEventListener('touchmove', onPointerMove);
      el.removeEventListener('touchend', onPointerUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.join('|'), speed]);

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hidden rounded-2xl shadow-lg"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        aria-hidden={!ready}
      >
        {tripled.map((src, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-full snap-center relative"
            style={{ minWidth: '100%' }}
          >
            <img
              src={src}
              alt={`Banner ${idx % images.length}`}
              className="w-full object-cover min-h-[150px] md:min-h-[300px] h-full"
              loading="lazy"
            />
            {/* contenido decorativo superpuesto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 pointer-events-none">
              {idx % images.length === 0 && (
                <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">La Mejor Comida Rápida de Bucaramanga</h2>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;