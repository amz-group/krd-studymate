import { useState } from 'react';
import { Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import ScaledSlide from '@/components/presentation/editor/ScaledSlide';
import PreviewPlayer from '@/components/presentation/editor/PreviewPlayer';
import { baseDimensions } from '@/lib/presentationModel';

export default function PreviewStep({ presentation, onFinish }) {
  const { t } = useApp();
  const [fs, setFs] = useState(false);
  const slides = presentation.content.slides;
  const ratio = presentation.content.ratio;
  const language = presentation.content.language;
  const { w, h } = baseDimensions(ratio);

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('pb.preview.title')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setFs(true)}><Eye className="h-4 w-4" /> {t('pb.preview.fullscreen')}</Button>
          <Button size="sm" className="gap-1.5" onClick={onFinish}><Save className="h-4 w-4" /> {t('pb.preview.saveFinish')}</Button>
        </div>
      </div>
      {slides.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('ev.preview.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slides.map((s, i) => (
            <div key={s.id} className="space-y-1">
              <p className="text-xs text-muted-foreground">{i + 1} / {slides.length}</p>
              <ScaledSlide slide={s} baseW={w} baseH={h} language={language} className="w-full rounded-lg border border-border shadow-sm" />
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">{t('pb.preview.exportSoon')}</p>
      {fs && <PreviewPlayer slides={slides} ratio={ratio} language={language} onClose={() => setFs(false)} />}
    </div>
  );
}