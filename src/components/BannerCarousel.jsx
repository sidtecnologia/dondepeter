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
  const timerRef = useRef(null);
  const isInteractingRef = useRef(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);

  // slides con clones: [last, ...images, first]
  const slides = images.length > 0 ? [images[images.length - 1], ...images, images[0]] : [];
  const totalSlides = slides.length; // images.length + 2

  // índice inicial en 1 (primer slide real)
  const [index, setIndex] = useState(1);
  const [width, setWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // medir ancho del contenedor y fijar anchos del track y slides en px
  useEffect(() => {
    const update = () => {
      const w = containerRef.current ? containerRef.current.clientWidth : 0;
      if (!w) return;
      setWidth(w);
      // ajustar track width y posicion actual
      if (trackRef.current) {
        trackRef.current.style.width = `${totalSlides * w}px`;
        // mover al índice actual sin transición
        trackRef.current.style.transition = 'none';
        const x = -index * w;
        trackRef.current.style.transform = `translateX(${x}px)`;
        currentTranslate.current = x;
        // forzar reflow para evitar que next transition use 'none'
        // eslint-disable-next-line no-unused-expressions
        trackRef.current.offsetHeight;
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    // include totalSlides to update when images array changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlides, index]);

  // movimiento con transición cuando cambia index
  useEffect(() => {
    if (!trackRef.current || width === 0) return;
    // apply transition
    trackRef.current.style.transition = `transform ${transitionMs}ms ease`;
    const x = -index * width;
    trackRef.current.style.transform = `translateX(${x}px)`;
    currentTranslate.current = x;
    setIsTransitioning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, width]);

  // manejar fin de transición para saltos en clones
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTransitionEnd = () => {
      setIsTransitioning(false);
      // si estamos en clone final (último índice) -> saltar a primer real (1) sin transición
      if (index === totalSlides - 1) {
        const realIndex = 1;
        track.style.transition = 'none';
        track.style.transform = `translateX(${-realIndex * width}px)`;
        currentTranslate.current = -realIndex * width;
        setIndex(realIndex);
      }
      // si estamos en clone inicial (0) -> saltar a último real (totalSlides - 2)
      if (index === 0) {
        const lastReal = totalSlides - 2;
        track.style.transition = 'none';
        track.style.transform = `translateX(${-lastReal * width}px)`;
        currentTranslate.current = -lastReal * width;
        setIndex(lastReal);
      }
    };

    track.addEventListener('transitionend', onTransitionEnd);
    return () => track.removeEventListener('transitionend', onTransitionEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, totalSlides, width]);

  // autoplay
  useEffect(() => {
    const startAutoplay = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!isInteractingRef.current && !dragging.current && width > 0) {
          setIndex((prev) => prev + 1);
        }
      }, interval);
    };

    startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, width, totalSlides]);

  // swipe / drag handlers
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    const onStart = (e) => {
      if (isTransitioning) return;
      dragging.current = true;
      isInteractingRef.current = true;
      startX.current = getClientX(e);
      startTranslate.current = currentTranslate.current;
      track.style.transition = 'none';
      if (timerRef.current) clearInterval(timerRef.current);
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
        // swipe left -> next
        setIndex((prev) => prev + 1);
      } else if (dx > threshold) {
        // swipe right -> prev
        setIndex((prev) => prev - 1);
      } else {
        // restore current
        track.style.transition = `transform ${transitionMs}ms ease`;
        track.style.transform = `translateX(${currentTranslate.current}px)`;
      }
      // restart autoplay
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!isInteractingRef.current && !dragging.current && width > 0) {
          setIndex((prev) => prev + 1);
        }
      }, interval);
    };

    // Touch events
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
  }, [width, isTransitioning, transitionMs, interval, totalSlides]);

  // pause on hover (desktop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onEnter = () => {
      isInteractingRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
    const onLeave = () => {
      isInteractingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!isInteractingRef.current && !dragging.current && width > 0) {
          setIndex((prev) => prev + 1);
        }
      }, interval);
    };
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    return () => {
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, interval]);

  if (images.length === 0) return null;

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
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 pointer-events-none">
                {i === 1 && (
                  <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">La mejor comida rápida de Bucaramanga</h2>
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