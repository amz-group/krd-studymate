import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Lock, Unlock, Upload, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { fonts } from '@/lib/presentationAssets';
import { downscaleImage } from '@/lib/editorUtils';
import { cn } from '@/lib/utils';
import { posterSizes, makeCustomSize } from '@/lib/posterModel';

function Row({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn('flex-1 rounded-md border px-2 py-1 text-xs font-medium', value === o.value ? 'border-primary bg-accent text-accent-foreground' : 'border-border hover:bg-accent/50')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorField({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value && value !== 'transparent' ? value : '#ffffff'} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 rounded border border-input cursor-pointer bg-transparent" />
      <Input value={value === 'transparent' ? '' : value || ''} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
    </div>
  );
}

function LayerButtons({ t, onForward, onBackward, onFront, onBack }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      <Button variant="outline" size="sm" onClick={onFront} title={t('ev.action.front')}><ChevronsUp className="h-3.5 w-3.5" /></Button>
      <Button variant="outline" size="sm" onClick={onForward} title={t('ev.action.forward')}><ChevronUp className="h-3.5 w-3.5" /></Button>
      <Button variant="outline" size="sm" onClick={onBackward} title={t('ev.action.backward')}><ChevronDown className="h-3.5 w-3.5" /></Button>
      <Button variant="outline" size="sm" onClick={onBack} title={t('ev.action.back')}><ChevronsDown className="h-3.5 w-3.5" /></Button>
    </div>
  );
}

function ActionRow({ t, onDuplicate, onDelete, onToggleLock, locked }) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleLock} title={locked ? t('ev.action.unlock') : t('ev.action.lock')}>
        {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title={t('ev.action.duplicate')}><Copy className="h-3.5 w-3.5" /></Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete} title={t('ev.action.delete')}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  );
}

export default function PosterPropertiesPanel({
  poster, selectedEls, selectedEl, onChangeElement, onChangeSize, onOpenPanel,
  onDuplicate, onDelete, onForward, onBackward, onFront, onBack, onToggleLock, onAlign, onDistribute,
}) {
  const { t } = useApp();
  return (
    <div className="w-72 shrink-0 border-s border-border bg-card overflow-y-auto p-3 space-y-4">
      {selectedEls.length > 1 ? (
        <MultiProps els={selectedEls} t={t} onAlign={onAlign} onDistribute={onDistribute} onDuplicate={onDuplicate} onDelete={onDelete} />
      ) : selectedEl ? (
        <ElementProps el={selectedEl} t={t} onChangeElement={onChangeElement} onDuplicate={onDuplicate} onDelete={onDelete}
          onForward={onForward} onBackward={onBackward} onFront={onFront} onBack={onBack} onToggleLock={onToggleLock} />
      ) : (
        <PosterProps poster={poster} t={t} onChangeSize={onChangeSize} onOpenPanel={onOpenPanel} />
      )}
    </div>
  );
}

function ElementProps({ el, t, onChangeElement, onDuplicate, onDelete, onForward, onBackward, onFront, onBack, onToggleLock }) {
  const updateContent = (patch) => onChangeElement(el.id, { content: patch });
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file);
    updateContent({ src });
  };
  const title = el.type === 'text' ? t('ev.props.text') : el.type === 'image' ? t('ev.props.image') : el.type === 'shape' ? t('ev.props.shape') : t('ev.props.icon');
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <ActionRow t={t} onDuplicate={onDuplicate} onDelete={onDelete} onToggleLock={onToggleLock} locked={el.locked} />
      </div>
      <Row label={t('ev.position')}>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground w-3">X</span><Input type="number" value={Math.round(el.x)} onChange={(e) => onChangeElement(el.id, { x: +e.target.value })} className="h-8" /></div>
          <div className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground w-3">Y</span><Input type="number" value={Math.round(el.y)} onChange={(e) => onChangeElement(el.id, { y: +e.target.value })} className="h-8" /></div>
        </div>
      </Row>
      <Row label={t('ev.size')}>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground w-3">W</span><Input type="number" value={Math.round(el.width)} onChange={(e) => onChangeElement(el.id, { width: Math.max(20, +e.target.value) })} className="h-8" /></div>
          <div className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground w-3">H</span><Input type="number" value={Math.round(el.height)} onChange={(e) => onChangeElement(el.id, { height: Math.max(20, +e.target.value) })} className="h-8" /></div>
        </div>
      </Row>
      <Row label={t('ev.action.forward')}><LayerButtons t={t} onForward={onForward} onBackward={onBackward} onFront={onFront} onBack={onBack} /></Row>

      {el.type === 'text' && (
        <>
          <Row label={t('ev.font')}>
            <select value={el.content.font} onChange={(e) => updateContent({ font: e.target.value })} className="w-full h-8 rounded-md border border-input bg-transparent text-xs px-2">
              {fonts.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </Row>
          <Row label={t('ev.fontSize')}>
            <Input type="number" value={el.content.size} onChange={(e) => updateContent({ size: Math.max(6, +e.target.value) })} className="h-8" />
          </Row>
          <div className="flex gap-1">
            <Button variant={el.content.bold ? 'secondary' : 'outline'} size="sm" className="flex-1" onClick={() => updateContent({ bold: !el.content.bold })}>B</Button>
            <Button variant={el.content.italic ? 'secondary' : 'outline'} size="sm" className="flex-1 italic" onClick={() => updateContent({ italic: !el.content.italic })}>I</Button>
            <Button variant={el.content.underline ? 'secondary' : 'outline'} size="sm" className="flex-1 underline" onClick={() => updateContent({ underline: !el.content.underline })}>U</Button>
          </div>
          <Row label={t('ev.color')}><ColorField value={el.content.color} onChange={(v) => updateContent({ color: v })} /></Row>
          <Row label={t('ev.highlight')}><ColorField value={el.content.highlight} onChange={(v) => updateContent({ highlight: v })} /></Row>
          <Row label={t('ev.align')}>
            <Segmented value={el.content.align} onChange={(v) => updateContent({ align: v })}
              options={[{ value: 'start', label: t('ev.alignLeft') }, { value: 'center', label: t('ev.alignCenter') }, { value: 'right', label: t('ev.alignRight') }, { value: 'justify', label: t('ev.alignJustify') }]} />
          </Row>
          <Row label={t('ev.list')}>
            <Segmented value={el.content.listType} onChange={(v) => updateContent({ listType: v })}
              options={[{ value: 'none', label: t('ev.listNone') }, { value: 'bullet', label: t('ev.listBullet') }, { value: 'number', label: t('ev.listNumber') }]} />
          </Row>
          <Row label={t('ev.lineHeight')}><Input type="number" step="0.1" value={el.content.lineHeight} onChange={(e) => updateContent({ lineHeight: +e.target.value })} className="h-8" /></Row>
          <Row label={t('ev.letterSpacing')}><Input type="number" value={el.content.letterSpacing} onChange={(e) => updateContent({ letterSpacing: +e.target.value })} className="h-8" /></Row>
          <Row label={t('ev.opacity')}><input type="range" min="0" max="1" step="0.05" value={el.content.opacity} onChange={(e) => updateContent({ opacity: +e.target.value })} className="w-full" /></Row>
        </>
      )}

      {el.type === 'image' && (
        <>
          <label className="flex items-center justify-center gap-2 rounded-md border border-input py-2 text-sm cursor-pointer hover:bg-accent">
            <Upload className="h-4 w-4" /> {el.content.src ? t('ev.image.replace') : t('ev.image.upload')}
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={upload} />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={!!el.content.lockAspect} onChange={(e) => updateContent({ lockAspect: e.target.checked })} />
            {t('ev.lockAspect')}
          </label>
          <Row label={t('ev.image.fit')}>
            <Segmented value={el.content.fit} onChange={(v) => updateContent({ fit: v })}
              options={[{ value: 'cover', label: t('ev.image.fill') }, { value: 'fit', label: t('ev.image.fit') }]} />
          </Row>
          <Row label={t('ev.radius')}><Input type="number" value={el.content.radius} onChange={(e) => updateContent({ radius: +e.target.value })} className="h-8" /></Row>
          <Row label={t('ev.image.shadow')}>
            <Segmented value={el.content.shadow ? 'on' : 'off'} onChange={(v) => updateContent({ shadow: v === 'on' })} options={[{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }]} />
          </Row>
          <Row label={t('ev.opacity')}><input type="range" min="0" max="1" step="0.05" value={el.content.opacity} onChange={(e) => updateContent({ opacity: +e.target.value })} className="w-full" /></Row>
        </>
      )}

      {el.type === 'shape' && (
        <>
          <Row label={t('ev.fill')}><ColorField value={el.content.fill} onChange={(v) => updateContent({ fill: v })} /></Row>
          <Row label={t('ev.border')}><ColorField value={el.content.border} onChange={(v) => updateContent({ border: v })} /></Row>
          <Row label={t('ev.borderWidth')}><Input type="number" value={el.content.borderWidth} onChange={(e) => updateContent({ borderWidth: +e.target.value })} className="h-8" /></Row>
          {(el.content.shape === 'rect' || el.content.shape === 'rounded') && (
            <Row label={t('ev.radius')}><Input type="number" value={el.content.radius} onChange={(e) => updateContent({ radius: +e.target.value })} className="h-8" /></Row>
          )}
          <Row label={t('ev.opacity')}><input type="range" min="0" max="1" step="0.05" value={el.content.opacity} onChange={(e) => updateContent({ opacity: +e.target.value })} className="w-full" /></Row>
        </>
      )}

      {el.type === 'icon' && (
        <>
          <Row label={t('ev.color')}><ColorField value={el.content.color} onChange={(v) => updateContent({ color: v })} /></Row>
          <Row label={t('ev.fontSize')}><Input type="number" value={el.content.size} onChange={(e) => updateContent({ size: Math.max(8, +e.target.value) })} className="h-8" /></Row>
          <Row label={t('ev.opacity')}><input type="range" min="0" max="1" step="0.05" value={el.content.opacity} onChange={(e) => updateContent({ opacity: +e.target.value })} className="w-full" /></Row>
        </>
      )}
    </>
  );
}

function MultiProps({ els, t, onAlign, onDistribute, onDuplicate, onDelete }) {
  const alignBtn = (label, fn) => (
    <Button variant="outline" size="sm" onClick={fn} className="text-xs">{label}</Button>
  );
  return (
    <>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {els.length} {t('ev.multi.elements')}
      </span>
      <Row label={t('ev.align.left')}>
        <div className="grid grid-cols-3 gap-1">
          {alignBtn(t('ev.align.left'), () => onAlign('left'))}
          {alignBtn(t('ev.align.centerH'), () => onAlign('centerH'))}
          {alignBtn(t('ev.align.right'), () => onAlign('right'))}
          {alignBtn(t('ev.align.top'), () => onAlign('top'))}
          {alignBtn(t('ev.align.middle'), () => onAlign('middle'))}
          {alignBtn(t('ev.align.bottom'), () => onAlign('bottom'))}
        </div>
      </Row>
      <Row label={t('ev.distribute.h')}>
        <div className="grid grid-cols-2 gap-1">
          {alignBtn(t('ev.distribute.h'), () => onDistribute('h'))}
          {alignBtn(t('ev.distribute.v'), () => onDistribute('v'))}
        </div>
      </Row>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onDuplicate}><Copy className="h-3.5 w-3.5" /> {t('ev.action.duplicate')}</Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /> {t('ev.action.delete')}</Button>
      </div>
    </>
  );
}

function PosterProps({ poster, t, onChangeSize, onOpenPanel }) {
  const size = poster.size;
  const [custom, setCustom] = useState({ w: 1000, h: 1000, unit: 'px' });
  const applySize = (id) => {
    if (id === 'custom') {
      const ns = makeCustomSize(custom.w, custom.h, custom.unit);
      onChangeSize(ns);
    } else {
      const found = posterSizes.find((s) => s.id === id);
      if (found) onChangeSize(found);
    }
  };
  return (
    <>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('poster.props.poster')}</span>
      <div className="grid grid-cols-2 gap-1">
        <Button variant="outline" size="sm" onClick={() => onOpenPanel('background')}>{t('ev.background')}</Button>
        <Button variant="outline" size="sm" onClick={() => onOpenPanel('templates')}>{t('ev.template')}</Button>
        <Button variant="outline" size="sm" onClick={() => onOpenPanel('layouts')}>{t('ev.layout')}</Button>
        <Button variant="outline" size="sm" onClick={() => onOpenPanel('sections')}>{t('poster.sections')}</Button>
      </div>
      <Row label={t('poster.size.title')}>
        <select value={size.id} onChange={(e) => applySize(e.target.value)} className="w-full h-8 rounded-md border border-input bg-transparent text-xs px-2">
          {posterSizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          <option value="custom">{t('poster.size.custom')}</option>
        </select>
      </Row>
      {size.id === 'custom' && (
        <div className="space-y-2 rounded-md border border-border p-2">
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder={t('poster.size.width')} value={custom.w} onChange={(e) => setCustom((c) => ({ ...c, w: +e.target.value }))} className="h-8" />
            <Input type="number" placeholder={t('poster.size.height')} value={custom.h} onChange={(e) => setCustom((c) => ({ ...c, h: +e.target.value }))} className="h-8" />
          </div>
          <Segmented value={custom.unit} onChange={(v) => setCustom((c) => ({ ...c, unit: v }))}
            options={[{ value: 'px', label: 'px' }, { value: 'mm', label: 'mm' }, { value: 'cm', label: 'cm' }]} />
          <Button size="sm" className="w-full" onClick={() => applySize('custom')}>{t('poster.size.apply')}</Button>
        </div>
      )}
      <Row label={t('poster.size.current')}>
        <p className="text-xs text-muted-foreground">{size.w} × {size.h} px</p>
      </Row>
      <p className="text-xs text-muted-foreground">{t('ev.props.none.desc')}</p>
    </>
  );
}