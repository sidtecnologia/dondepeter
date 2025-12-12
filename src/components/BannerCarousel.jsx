import { useRef, useEffect, useState } from 'react';

/**
 * Props:
 * - images: array de URLs (required)
 * - speed: velocidad en px/seg (default 40)
 */
const BannerCarousel = ({ images = [], speed = 40 }) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const offsetRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);

  if (!images || images.length === 0) return null;

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let mounted = true;

    const recalc = () => {
      const w = container.clientWidth;
      setSlideWidth(w);
      // keep offset modulo threshold after resize
      const threshold = w * images.length;
      offsetRef.current = offsetRef.current % threshold;
      // position track accordingly
      track.style.transform = `translateX(${-offsetRef.current}px)`;
      setReady(true);
    };

    recalc();
    window.addEventListener('resize', recalc);

    const pxPerMs = speed / 1000;

    const step = (ts) => {
      if (!mounted) return;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;

      // advance offset
      offsetRef.current += pxPerMs * delta;

      const threshold = slideWidth * images.length || container.clientWidth * images.length;
      if (threshold > 0 && offsetRef.current >= threshold) {
        // wrap around to create continuity
        offsetRef.current = offsetRef.current - threshold;
      }

      // apply transform
      if (track) track.style.transform = `translateX(${-offsetRef.current}px)`;

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    // disable pointer interactions so it "moves solo"
    container.style.touchAction = 'none';
    container.style.pointerEvents = 'none';

    return () => {
      mounted = false;
      window.removeEventListener('resize', recalc);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      // re-enable pointer events when unmount
      if (container) {
        container.style.pointerEvents = '';
        container.style.touchAction = '';
      }
    };
    // note: intentionally not including slideWidth in deps so animation smooth; resize handler updates it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.join('|'), speed]);

  // Render two copies of images for seamless loop
  const items = [...images, ...images];

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-2xl shadow-lg"
        aria-hidden={!ready}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ transition: 'transform 0s linear' }}
        >
          {items.map((src, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-full relative"
              style={{ minWidth: '100%' }}
              aria-hidden="true"
            >
              <img
                src={src}
                alt={`Banner ${idx % images.length + 1}`}
                className="w-full object-cover min-h-[150px] md:min-h-[300px] h-full"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 pointer-events-none">
                {idx % images.length === 0 && (
                  <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg"></h2>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;