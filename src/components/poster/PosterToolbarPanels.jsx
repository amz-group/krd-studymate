import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { PanelDrawer, IconsPanel, BackgroundPanel } from '@/components/presentation/editor/ToolbarPanels';
import ScaledSlide from '@/components/presentation/editor/ScaledSlide';
import {
  posterTemplates, posterLayouts, posterExamples, sectionBlocks,
  buildPosterFromTemplate, buildPosterFromLayout, buildExamplePoster,
} from '@/lib/posterModel';

const PREV = { w: 600, h: 800 };

export function PosterTemplatesPanel({ onApply }) {
  const { t } = useApp();
  const cats = [
    { id: 'academic', label: t('poster.template.category.academic') },
    { id: 'technology', label: t('poster.template.category.technology') },
    { id: 'general', label: t('poster.template.category.general') },
  ];
  return (
    <div className="space-y-5">
      {cats.map((cat) => (
        <div key={cat.id}>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{cat.label}</p>
          <div className="space-y-3">
            {posterTemplates.filter((tpl) => tpl.category === cat.id).map((tpl) => {
              const preview = buildPosterFromTemplate(tpl, PREV, t);
              return (
                <div key={tpl.id} className="rounded-xl border border-border p-3 space-y-2">
                  <p className="text-sm font-medium">{tpl.name}</p>
                  <ScaledSlide slide={preview} baseW={PREV.w} baseH={PREV.h} language="en" className="w-full rounded border border-border overflow-hidden" />
                  <Button size="sm" className="w-full" onClick={() => onApply(tpl)}>{t('poster.template.use')}</Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PosterLayoutsPanel({ onApply }) {
  const { t } = useApp();
  const noop = () => '';
  return (
    <div className="grid grid-cols-2 gap-3">
      {posterLayouts.map((l) => {
        const els = buildPosterFromLayout(l, PREV, noop, []);
        const slide = { background: { type: 'solid', color: '#ffffff' }, elements: els };
        return (
          <button key={l.id} onClick={() => onApply(l)} className="text-start space-y-1 group">
            <p className="text-xs font-medium">{l.name}</p>
            <div className="rounded border border-border overflow-hidden group-hover:border-primary">
              <ScaledSlide slide={slide} baseW={PREV.w} baseH={PREV.h} language="en" className="w-full" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function PosterExamplesPanel({ onUse }) {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      {posterExamples.map((ex) => {
        const built = buildExamplePoster(ex, t);
        return (
          <div key={ex.id} className="rounded-xl border border-border p-3 space-y-2">
            <p className="text-sm font-medium">{ex.name}</p>
            <ScaledSlide slide={built} baseW={built.size.w} baseH={built.size.h} language="en" className="w-full rounded border border-border overflow-hidden" />
            <Button size="sm" className="w-full" onClick={() => onUse(ex)}>{t('poster.example.use')}</Button>
          </div>
        );
      })}
    </div>
  );
}

export function PosterSectionsPanel({ onAdd }) {
  const { t } = useApp();
  return (
    <div className="grid grid-cols-2 gap-2">
      {sectionBlocks.map((b) => (
        <Button key={b.id} variant="outline" size="sm" onClick={() => onAdd(b)}>{t(b.labelKey)}</Button>
      ))}
    </div>
  );
}

export function PosterAddPanel({ onAddText, onAddShape, onAddImageFile, onAddLogo }) {
  const { t } = useApp();
  const textRoles = ['heading', 'subheading', 'body', 'caption', 'quote', 'label'];
  const shapes = ['rect', 'rounded', 'circle', 'line', 'arrow'];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('ev.addText')}</p>
        <div className="grid grid-cols-2 gap-2">
          {textRoles.map((r) => <Button key={r} variant="outline" size="sm" onClick={() => onAddText(r)}>{t(`ev.text.${r}`)}</Button>)}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('ev.addShape')}</p>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((s) => <Button key={s} variant="outline" size="sm" onClick={() => onAddShape(s)}>{t(`ev.shape.${s}`)}</Button>)}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('ev.addImage')}</p>
        <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-input py-6 text-sm cursor-pointer hover:bg-accent">
          {t('ev.image.upload')}
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={onAddImageFile} />
        </label>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('poster.logo')}</p>
        <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-input py-4 text-sm cursor-pointer hover:bg-accent">
          {t('poster.logo.upload')}
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={onAddLogo} />
        </label>
      </div>
    </div>
  );
}

export { PanelDrawer, IconsPanel, BackgroundPanel };