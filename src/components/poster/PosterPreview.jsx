import { useRef, useEffect, useState } from 'react';
import SlideRenderer from '@/components/presentation/editor/SlideRenderer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

// Full-screen, read-only poster preview that exactly matches the editor output.
export default function PosterPreview({ poster, onClose }) {
  const { t } = useApp();
  const ref = useRef(null);
  const [scale, setScale] = useState(0);
  const size = poster.size;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const pad = 64;
      const s = Math.min((el.clientWidth - pad) / size.w, (el.clientHeight - pad) / size.h);
      setScale(isFinite(s) && s > 0 ? s : 0.1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size.w, size.h]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-4 h-12 text-white shrink-0">
        <span className="text-sm font-medium">{t('poster.preview')}</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10"><X className="h-5 w-5" /></Button>
      </div>
      <div ref={ref} className="flex-1 flex items-center justify-center overflow-auto p-6">
        <div style={{ width: size.w * scale, height: size.h * scale, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ width: size.w, height: size.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <SlideRenderer slide={poster} baseW={size.w} baseH={size.h} language={poster.language || 'en'} />
          </div>
        </div>
      </div>
    </div>
  );
}