import { useApp } from '@/lib/AppContext';
import { Label } from '@/components/ui/label';
import SlideCanvas from '../SlideCanvas';
import { themes, getTheme } from '@/lib/presentationModel';
import { cn } from '@/lib/utils';

function Segmented({ options, value, onChange, getKey }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn('rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors',
            value === o.value ? 'border-primary bg-accent text-accent-foreground' : 'border-border hover:bg-accent/50')}>
          {getKey(o)}
        </button>
      ))}
    </div>
  );
}

export default function DesignStep({ presentation, update }) {
  const { t } = useApp();
  const d = presentation.content.design;
  const set = (patch) => update((c) => ({ ...c, design: { ...c.design, ...patch } }));
  const firstSlide = presentation.content.slides[0];

  return (
    <div className="py-4 grid lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div>
          <Label className="mb-2 block">{t('pb.design.theme')}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themes.map((th) => (
              <button key={th.id} type="button" onClick={() => set({ theme: th.id, primaryColor: null, accentColor: null })}
                className={cn('rounded-xl border p-3 text-start transition-all', d.theme === th.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40')}>
                <div className="flex gap-1.5 mb-2">
                  <span className="h-6 w-6 rounded" style={{ background: th.primary }} />
                  <span className="h-6 w-6 rounded" style={{ background: th.accent }} />
                  <span className="h-6 w-6 rounded border" style={{ background: th.bg }} />
                </div>
                <span className="text-xs font-medium">{t(th.nameKey)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">{t('pb.design.primaryColor')}</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={d.primaryColor || getTheme(d.theme).primary} onChange={(e) => set({ primaryColor: e.target.value })} className="h-9 w-12 rounded border border-input bg-transparent cursor-pointer" />
              <button className="text-xs text-muted-foreground underline" onClick={() => set({ primaryColor: null })}>{t('pb.design.reset')}</button>
            </div>
          </div>
          <div>
            <Label className="mb-2 block">{t('pb.design.accentColor')}</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={d.accentColor || getTheme(d.theme).accent} onChange={(e) => set({ accentColor: e.target.value })} className="h-9 w-12 rounded border border-input bg-transparent cursor-pointer" />
              <button className="text-xs text-muted-foreground underline" onClick={() => set({ accentColor: null })}>{t('pb.design.reset')}</button>
            </div>
          </div>
        </div>
        <div>
          <Label className="mb-2 block">{t('pb.design.fontSize')}</Label>
          <Segmented options={[{ value: 'sm' }, { value: 'md' }, { value: 'lg' }]} value={d.fontSize} onChange={(v) => set({ fontSize: v })} getKey={(o) => t(`pb.font.${o.value}`)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">{t('pb.design.titleAlign')}</Label>
            <Segmented options={[{ value: 'start' }, { value: 'center' }, { value: 'end' }]} value={d.titleAlign} onChange={(v) => set({ titleAlign: v })} getKey={(o) => t(`pb.align.${o.value}`)} />
          </div>
          <div>
            <Label className="mb-2 block">{t('pb.design.bodyAlign')}</Label>
            <Segmented options={[{ value: 'start' }, { value: 'center' }, { value: 'end' }]} value={d.bodyAlign} onChange={(v) => set({ bodyAlign: v })} getKey={(o) => t(`pb.align.${o.value}`)} />
          </div>
        </div>
        <div>
          <Label className="mb-2 block">{t('pb.design.background')}</Label>
          <Segmented options={[{ value: 'solid' }, { value: 'gradient' }, { value: 'pattern' }]} value={d.background?.type || 'solid'} onChange={(v) => set({ background: { type: v } })} getKey={(o) => t(`pb.bg.${o.value}`)} />
        </div>
        <div>
          <Label className="mb-2 block">{t('pb.design.ratio')}</Label>
          <Segmented options={[{ value: '16:9' }, { value: '4:3' }]} value={presentation.content.ratio} onChange={(v) => update((c) => ({ ...c, ratio: v }))} getKey={(o) => t(`pb.ratio.${o.value.replace(':', '_')}`)} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-start">
        {firstSlide ? <SlideCanvas slide={firstSlide} presentation={presentation} className="w-full max-w-xl rounded-xl border border-border shadow-sm" /> : null}
      </div>
    </div>
  );
}