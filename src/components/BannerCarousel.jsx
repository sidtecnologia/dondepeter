import { useRef, useState, useEffect } from 'react';

/**
 * BannerCarousel
 * - Carousel horizontal táctil usando scroll-snap (no librerías).
 * - Soporta swipe táctil, botones prev/next y indicadores.
 * - Recibe `images` array de URLs.
 */
const BannerCarousel = ({ images = [], autoPlay = false, autoPlayInterval = 5000 }) => {
  const containerRef = useRef(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setCurrent(index);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Auto play
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const t = setInterval(() => {
      const next = (current + 1) % images.length;
      scrollToIndex(next);
    }, autoPlayInterval);
    return () => clearInterval(t);
  }, [autoPlay, autoPlayInterval, current, images.length]);

  const scrollToIndex = (index) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      left: containerRef.current.clientWidth * index,
      behavior: 'smooth'
    });
    setCurrent(index);
  };

  // Prev / Next
  const prev = () => scrollToIndex(Math.max(0, current - 1));
  const next = () => scrollToIndex(Math.min(images.length - 1, current + 1));

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hidden rounded-2xl shadow-lg"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {images.map((src, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-full snap-center relative"
            style={{ minWidth: '100%' }}
          >
            <img
              src={src}
              alt={`Banner ${idx + 1}`}
              className="w-full object-cover min-h-[150px] md:min-h-[300px] h-full"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 pointer-events-none">
              {idx === 0 && (
                <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">Las Mejores Hamburguesas</h2>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prev/Next buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-20"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white z-20"
          >
            ›
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${current === idx ? 'bg-white w-4' : 'bg-white/60'}`}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;