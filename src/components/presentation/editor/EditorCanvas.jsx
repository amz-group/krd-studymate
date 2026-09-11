import { useRef, useEffect, useState } from 'react';
import CanvasElement from './CanvasElement';
import { bgCss } from './SlideRenderer';
import { baseDimensions } from '@/lib/presentationModel';

// Center panel: renders the current slide at a zoom level with interactive elements.
export default function EditorCanvas({
  slide, language, ratio, zoom, selectedId, editingId, showGrid, snap,
  onSelectElement, onChangeElement, onStartEdit, onEndEdit, onBackgroundClick,
}) {
  const ref = useRef(null);
  const [fit, setFit] = useState(1);
  const { w: baseW, h: baseH } = baseDimensions(ratio);
  const scale = fit * (zoom / 100);
  const peers = slide.elements.filter((e) => e.id !== selectedId);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setFit((el.clientWidth - 48) / baseW);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseW]);

  const elements = [...slide.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div ref={ref} className="flex-1 min-w-0 overflow-auto bg-muted/40 p-6 flex items-start justify-center">
      <div style={{ width: baseW * scale, height: baseH * scale, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
        <div
          onPointerDown={(e) => { if (e.target === e.currentTarget) onBackgroundClick(); }}
          style={{ width: baseW, height: baseH, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', ...bgCss(slide.background) }}
        >
          {slide.background && slide.background.type === 'image' && slide.background.image && (
            <img src={slide.background.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: slide.background.imageOpacity ?? 1, pointerEvents: 'none' }} />
          )}
          {slide.background && slide.background.overlay && (
            <div style={{ position: 'absolute', inset: 0, background: slide.background.overlay, opacity: slide.background.overlayOpacity ?? 0.3, pointerEvents: 'none' }} />
          )}
          {showGrid && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#94a3b833 1px, transparent 1px), linear-gradient(90deg, #94a3b833 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          )}
          {elements.map((el) => (
            <CanvasElement
              key={el.id} el={el} scale={scale} selected={selectedId === el.id} editing={editingId === el.id}
              peers={peers} slideW={baseW} slideH={baseH} snap={snap}
              onSelect={onSelectElement} onChange={(patch) => onChangeElement(el.id, patch)}
              onStartEdit={onStartEdit} onEndEdit={onEndEdit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}