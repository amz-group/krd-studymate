import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';

const presets = [5, 7, 10, 12, 15];

export default function SlidesStep({ presentation, update }) {
  const { t } = useApp();
  const count = Number(presentation.content.slideCount);
  const isCustom = !presets.includes(count);
  const [custom, setCustom] = useState(isCustom ? String(count) : '');
  const setCount = (n) => update((c) => ({ ...c, slideCount: n }));
  const customNum = parseInt(custom, 10);
  const customValid = !custom || (customNum >= 3 && customNum <= 30);

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('pb.slides.question')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('pb.slides.recommended')}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {presets.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={cn(
              'rounded-xl border px-4 py-4 text-lg font-semibold transition-all',
              count === n ? 'border-primary bg-accent text-accent-foreground' : 'border-border hover:border-primary/40 hover:bg-accent/50'
            )}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { if (customNum >= 3 && customNum <= 30) setCount(customNum); else setCount(7); }}
          className={cn(
            'rounded-xl border px-4 py-4 text-lg font-semibold transition-all',
            isCustom ? 'border-primary bg-accent text-accent-foreground' : 'border-border hover:border-primary/40 hover:bg-accent/50'
          )}
        >
          {t('pb.slides.custom')}
        </button>
      </div>
      <div className="space-y-2 max-w-xs">
        <Label>{t('pb.slides.customLabel')}</Label>
        <Input
          type="number"
          min={3}
          max={30}
          value={custom}
          onChange={(e) => { setCustom(e.target.value); const n = parseInt(e.target.value, 10); if (n >= 3 && n <= 30) setCount(n); }}
          placeholder="3–30"
        />
        {!customValid && <p className="text-xs text-destructive">{t('pb.slides.invalid')}</p>}
        <p className="text-xs text-muted-foreground">{t('pb.slides.min')} · {t('pb.slides.max')}</p>
      </div>
    </div>
  );
}