import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import ScaledSlide from './ScaledSlide';
import { baseDimensions, buildSlideFromLayout, applyTemplate, buildExampleSlides } from '@/lib/presentationModel';
import { templates, layoutList, examples, iconCategories, iconMap, defaultTextContent } from '@/lib/presentationAssets';
import { downscaleImage } from '@/lib/editorUtils';
import { cn } from '@/lib/utils';

export function PanelDrawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-card border-s border-border shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

function MiniSlide({ slide, language, ratio }) {
  const { w, h } = baseDimensions(ratio);
  return <ScaledSlide slide={slide} baseW={w} baseH={h} language={language} className="w-full rounded border border-border overflow-hidden" />;
}

export function AddPanel({ language, ratio, onAddText, onAddShape, onAddImageFile }) {
  const { t } = useApp();
  const textRoles = ['heading', 'subheading', 'body', 'caption', 'quote'];
  const shapes = ['rect', 'rounded', 'circle', 'line', 'arrow'];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('ev.addText')}</p>
        <div className="grid grid-cols-2 gap-2">
          {textRoles.map((r) => (
            <Button key={r} variant="outline" size="sm" onClick={() => onAddText(r)}>{t(`ev.text.${r}`)}</Button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('ev.addShape')}</p>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => onAddShape(s)}>{t(`ev.shape.${s}`)}</Button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('ev.addImage')}</p>
        <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-input py-6 text-sm cursor-pointer hover:bg-accent">
          {t('ev.image.upload')}
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={onAddImageFile} />
        </label>
      </div>
    </div>
  );
}

export function TemplatesPanel({ language, ratio, onApply }) {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      {templates.map((tpl) => {
        const cover = applyTemplate(buildSlideFromLayout('title', t), tpl, true);
        cover.elements[0].content.text = tpl.name;
        const content = applyTemplate(buildSlideFromLayout('titleBullets', t), tpl, false);
        return (
          <div key={tpl.id} className="rounded-xl border border-border p-3 space-y-2">
            <p className="text-sm font-medium">{tpl.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-[10px] text-muted-foreground mb-1">{t('ev.template.cover')}</p><MiniSlide slide={cover} language={language} ratio={ratio} /></div>
              <div><p className="text-[10px] text-muted-foreground mb-1">{t('ev.template.content')}</p><MiniSlide slide={content} language={language} ratio={ratio} /></div>
            </div>
            <Button size="sm" className="w-full" onClick={() => onApply(tpl)}>{t('ev.template.use')}</Button>
          </div>
        );
      })}
    </div>
  );
}

export function LayoutsPanel({ language, ratio, onApply }) {
  const { t } = useApp();
  return (
    <div className="grid grid-cols-2 gap-3">
      {layoutList.map((l) => {
        const slide = buildSlideFromLayout(l.id, t);
        return (
          <button key={l.id} onClick={() => onApply(l.id)} className="text-start space-y-1 group">
            <p className="text-xs font-medium">{l.label}</p>
            <div className="rounded border border-border overflow-hidden group-hover:border-primary">
              <MiniSlide slide={slide} language={language} ratio={ratio} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function BackgroundPanel({ slide, onChange }) {
  const { t } = useApp();
  const bg = slide.background || { type: 'solid', color: '#ffffff' };
  const set = (patch) => onChange({ ...bg, ...patch });
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file, 1920, 0.85);
    set({ type: 'image', image: src });
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {[{ v: 'solid', l: t('ev.bg.solid') }, { v: 'gradient', l: t('ev.bg.gradient') }, { v: 'image', l: t('ev.bg.image') }].map((o) => (
          <Button key={o.v} variant={bg.type === o.v ? 'secondary' : 'outline'} size="sm" className="flex-1" onClick={() => set({ type: o.v })}>{o.l}</Button>
        ))}
      </div>
      {bg.type === 'solid' && (
        <label className="text-xs text-muted-foreground block">{t('ev.bg.color')}
          <input type="color" value={bg.color || '#ffffff'} onChange={(e) => set({ color: e.target.value })} className="mt-1 h-9 w-full rounded border border-input cursor-pointer bg-transparent" />
        </label>
      )}
      {bg.type === 'gradient' && (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground block">{t('ev.bg.color')}
            <input type="color" value={bg.color || '#7c3aed'} onChange={(e) => set({ color: e.target.value })} className="mt-1 h-9 w-full rounded border border-input cursor-pointer bg-transparent" />
          </label>
          <label className="text-xs text-muted-foreground block">{t('ev.bg.color2')}
            <input type="color" value={bg.color2 || '#a78bfa'} onChange={(e) => set({ color2: e.target.value })} className="mt-1 h-9 w-full rounded border border-input cursor-pointer bg-transparent" />
          </label>
        </div>
      )}
      {bg.type === 'image' && (
        <div className="space-y-3">
          <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-input py-4 text-sm cursor-pointer hover:bg-accent">
            {t('ev.image.upload')}
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={upload} />
          </label>
          <label className="text-xs text-muted-foreground block">{t('ev.bg.imageOpacity')}
            <input type="range" min="0" max="1" step="0.05" value={bg.imageOpacity ?? 1} onChange={(e) => set({ imageOpacity: +e.target.value })} className="w-full" />
          </label>
          <label className="text-xs text-muted-foreground block">{t('ev.bg.overlay')}
            <input type="color" value={bg.overlay || '#000000'} onChange={(e) => set({ overlay: e.target.value })} className="mt-1 h-9 w-full rounded border border-input cursor-pointer bg-transparent" />
          </label>
          <label className="text-xs text-muted-foreground block">{t('ev.opacity')}
            <input type="range" min="0" max="1" step="0.05" value={bg.overlayOpacity ?? 0.3} onChange={(e) => set({ overlayOpacity: +e.target.value })} className="w-full" />
          </label>
        </div>
      )}
    </div>
  );
}

export function IconsPanel({ onAdd }) {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      {iconCategories.map((cat) => (
        <div key={cat.id}>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{cat.label}</p>
          <div className="grid grid-cols-6 gap-2">
            {cat.icons.map((name) => {
              const Comp = iconMap[name];
              return (
                <button key={name} title={name} onClick={() => onAdd(name)}
                  className="flex items-center justify-center h-10 rounded-md border border-border hover:border-primary hover:bg-accent">
                  <Comp className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExamplesPanel({ language, ratio, onUse }) {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      {examples.map((ex) => {
        const slides = buildExampleSlides(ex, t);
        return (
          <div key={ex.id} className="rounded-xl border border-border p-3 space-y-2">
            <p className="text-sm font-medium">{ex.name}</p>
            <MiniSlide slide={slides[0]} language={language} ratio={ratio} />
            <Button size="sm" className="w-full" onClick={() => onUse(ex)}>{t('ev.example.use')}</Button>
          </div>
        );
      })}
    </div>
  );
}