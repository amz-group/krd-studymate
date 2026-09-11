import { useApp } from '@/lib/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ArrowUp, ArrowDown, Lock, Unlock, Upload } from 'lucide-react';
import { fonts } from '@/lib/presentationAssets';
import { downscaleImage } from '@/lib/editorUtils';
import { cn } from '@/lib/utils';

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

export default function PropertiesPanel({
  slide, selectedEl, ratio, onChangeElement, onChangeRatio, onChangeSlideNotes,
  onDuplicate, onDelete, onForward, onBackward, onToggleLock,
}) {
  const { t } = useApp();

  return (
    <div className="w-72 shrink-0 border-s border-border bg-card overflow-y-auto p-3 space-y-4">
      {selectedEl ? (
        <ElementProps el={selectedEl} t={t} onChangeElement={onChangeElement} onDuplicate={onDuplicate} onDelete={onDelete} onForward={onForward} onBackward={onBackward} onToggleLock={onToggleLock} />
      ) : (
        <SlideProps slide={slide} ratio={ratio} t={t} onChangeRatio={onChangeRatio} onChangeSlideNotes={onChangeSlideNotes} />
      )}
    </div>
  );
}

function ElementProps({ el, t, onChangeElement, onDuplicate, onDelete, onForward, onBackward, onToggleLock }) {
  const updateContent = (patch) => onChangeElement(el.id, { content: patch });
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const src = await downscaleImage(file);
    updateContent({ src });
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {el.type === 'text' ? t('ev.props.text') : el.type === 'image' ? t('ev.props.image') : el.type === 'shape' ? t('ev.props.shape') : t('ev.props.icon')}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onForward} title={t('ev.action.forward')}><ArrowUp className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBackward} title={t('ev.action.backward')}><ArrowDown className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleLock} title={el.locked ? t('ev.action.unlock') : t('ev.action.lock')}>
            {el.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title={t('ev.action.duplicate')}><Copy className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete} title={t('ev.action.delete')}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

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

function SlideProps({ slide, ratio, t, onChangeRatio, onChangeSlideNotes }) {
  return (
    <>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('ev.props.slide')}</span>
      <Row label={t('ev.props.slide')}>
        <Segmented value={ratio} onChange={onChangeRatio} options={[{ value: '16:9', label: '16:9' }, { value: '4:3', label: '4:3' }]} />
      </Row>
      <Row label={t('pb.content.notes')}>
        <Textarea value={slide.notes || ''} onChange={(e) => onChangeSlideNotes(e.target.value)} rows={6} />
      </Row>
      <p className="text-xs text-muted-foreground">{t('ev.props.none.desc')}</p>
    </>
  );
}