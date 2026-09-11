import { useRef, useEffect, useState } from 'react';
import SlideRenderer from './SlideRenderer';

// Measures its container and scales a base-size slide to fit the width.
// Used for thumbnails and preview (read-only).
export default function ScaledSlide({ slide, baseW, baseH, language, className }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / baseW);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseW]);
  return (
    <div ref={ref} className={className} style={{ aspectRatio: `${baseW} / ${baseH}`, overflow: 'hidden' }}>
      <div style={{ width: baseW, height: baseH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <SlideRenderer slide={slide} baseW={baseW} baseH={baseH} language={language} />
      </div>
    </div>
  );
}