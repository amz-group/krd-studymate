import ElementView from './ElementView';
import { isRtl } from '@/lib/presentationModel';

function bgCss(bg) {
  if (!bg) return { backgroundColor: '#ffffff' };
  if (bg.type === 'gradient') return { background: `linear-gradient(135deg, ${bg.color || '#fff'}, ${bg.color2 || '#e2e8f0'})` };
  return { backgroundColor: bg.color || '#ffffff' };
}

// Static (non-interactive) renderer of a slide at its base pixel size.
// The parent scales it. Used for thumbnails and preview.
export default function SlideRenderer({ slide, baseW, baseH, language, overlay }) {
  const rtl = isRtl(language);
  const bg = slide.background || { type: 'solid', color: '#ffffff' };
  const elements = [...slide.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  const baseStyle = { width: baseW, height: baseH, position: 'relative', overflow: 'hidden', direction: rtl ? 'rtl' : 'ltr' };
  const bgStyle = bg.type === 'image' ? { backgroundColor: bg.color || '#ffffff' } : bgCss(bg);
  return (
    <div style={{ ...baseStyle, ...bgStyle }}>
      {bg.type === 'image' && bg.image && (
        <img src={bg.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: bg.imageOpacity ?? 1, pointerEvents: 'none' }} />
      )}
      {bg.overlay && (
        <div style={{ position: 'absolute', inset: 0, background: bg.overlay, opacity: bg.overlayOpacity ?? 0.3, pointerEvents: 'none' }} />
      )}
      {elements.map((el) => (
        <div key={el.id} style={{
          position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height,
          transform: `rotate(${el.rotation || 0}deg)`, zIndex: el.zIndex || 0,
        }}>
          <ElementView el={el} />
        </div>
      ))}
      {overlay}
    </div>
  );
}

export { bgCss };