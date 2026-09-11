import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import ScaledSlide from './ScaledSlide';
import { baseDimensions } from '@/lib/presentationModel';

export default function PreviewPlayer({ slides, ratio, language, onClose }) {
  const { t } = useApp();
  const [idx, setIdx] = useState(0);
  const total = slides.length;
  const { w, h } = baseDimensions(ratio);

  const next = useCallback(() => setIdx((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  if (total === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-white/70">{t('ev.preview.empty')}</p>
        <Button variant="outline" className="absolute top-4 end-4" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <Button variant="outline" className="absolute top-4 end-4 z-10" onClick={onClose}><X className="h-4 w-4" /></Button>
      <div className="w-full max-w-6xl">
        <ScaledSlide slide={slides[idx]} baseW={w} baseH={h} language={language} className="w-full rounded-lg shadow-2xl" />
      </div>
      <div className="mt-4 flex items-center gap-3 text-white">
        <Button variant="outline" size="icon" onClick={prev} disabled={idx === 0}><ChevronLeft className="h-5 w-5" /></Button>
        <span className="text-sm">{idx + 1} / {total}</span>
        <Button variant="outline" size="icon" onClick={next} disabled={idx === total - 1}><ChevronRight className="h-5 w-5" /></Button>
      </div>
    </div>
  );
}