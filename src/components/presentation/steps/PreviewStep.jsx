import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import SlideCanvas from '../SlideCanvas';

export default function PreviewStep({ presentation, onFinish }) {
  const { t } = useApp();
  const slides = presentation.content.slides;
  const [idx, setIdx] = useState(0);
  const [fs, setFs] = useState(false);
  const total = slides.length;

  const next = useCallback(() => setIdx((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    if (!fs) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') setFs(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fs, next, prev]);

  if (total === 0) return <div className="py-16 text-center text-muted-foreground">{t('pb.preview.empty')}</div>;
  const slide = slides[idx];

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{idx + 1} {t('pb.preview.slideOf')} {total}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={idx === 0} className="gap-1.5"><ChevronLeft className="h-4 w-4" />{t('pb.preview.prev')}</Button>
          <Button variant="outline" size="sm" onClick={next} disabled={idx === total - 1} className="gap-1.5">{t('pb.preview.next')}<ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setFs(true)} className="gap-1.5"><Maximize2 className="h-4 w-4" />{t('pb.preview.fullscreen')}</Button>
        </div>
      </div>
      <SlideCanvas slide={slide} presentation={presentation} className="w-full max-w-4xl mx-auto rounded-xl border border-border shadow-md" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{t('pb.preview.exportSoon')}</p>
        <Button onClick={onFinish} className="gap-2"><Save className="h-4 w-4" />{t('pb.preview.saveFinish')}</Button>
      </div>

      {fs && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
          <button className="absolute top-4 end-4 text-white/80 hover:text-white" onClick={() => setFs(false)} aria-label={t('pb.preview.exit')}><X className="h-8 w-8" /></button>
          <SlideCanvas slide={slide} presentation={presentation} className="w-full max-w-6xl rounded-lg shadow-2xl" />
          <div className="mt-4 flex items-center gap-3 text-white">
            <Button variant="outline" size="icon" onClick={prev} disabled={idx === 0}><ChevronLeft className="h-5 w-5" /></Button>
            <span className="text-sm">{idx + 1} / {total}</span>
            <Button variant="outline" size="icon" onClick={next} disabled={idx === total - 1}><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}