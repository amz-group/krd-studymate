import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { base44 } from '@/api/base44Client';
import { newReference } from '@/lib/presentationModel';

function BulletsEditor({ slide, onUpdate }) {
  const { t } = useApp();
  const set = (bullets) => onUpdate({ bullets });
  return (
    <div className="space-y-2">
      <Label>{t('pb.content.bullets')}</Label>
      <div className="space-y-2">
        {slide.bullets.map((b, i) => (
          <div key={i} className="flex gap-2">
            <Input value={b} onChange={(e) => set(slide.bullets.map((x, j) => (j === i ? e.target.value : x)))} />
            <Button variant="ghost" size="icon" onClick={() => set(slide.bullets.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => set([...slide.bullets, ''])}><Plus className="h-4 w-4" />{t('pb.content.addBullet')}</Button>
    </div>
  );
}

function ReferencesEditor({ presentation, onUpdateReferences }) {
  const { t } = useApp();
  const refs = presentation.content.references;
  const set = (i, patch) => onUpdateReferences(refs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = () => onUpdateReferences([...refs, newReference()]);
  const remove = (i) => onUpdateReferences(refs.filter((_, j) => j !== i));
  return (
    <div className="space-y-3">
      <Label>{t('pb.content.references')}</Label>
      {refs.map((r, i) => (
        <div key={r.id || i} className="rounded-xl border border-border p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={r.title} onChange={(e) => set(i, { title: e.target.value })} placeholder={t('pb.content.refTitle')} />
            <Input value={r.author} onChange={(e) => set(i, { author: e.target.value })} placeholder={t('pb.content.refAuthor')} />
            <Input value={r.year} onChange={(e) => set(i, { year: e.target.value })} placeholder={t('pb.content.refYear')} />
            <Input value={r.link} onChange={(e) => set(i, { link: e.target.value })} placeholder={t('pb.content.refLink')} />
          </div>
          <Button variant="ghost" size="sm" className="text-destructive gap-1.5" onClick={() => remove(i)}><Trash2 className="h-3.5 w-3.5" />{t('pb.student.removeStudent')}</Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="gap-2" onClick={add}><Plus className="h-4 w-4" />{t('pb.content.addReference')}</Button>
    </div>
  );
}

function ImageEditor({ slide, onUpdate }) {
  const { t } = useApp();
  const [uploading, setUploading] = useState(false);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onUpdate({ image: file_url });
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-2">
      <Label>{t('pb.content.image')}</Label>
      <div className="flex gap-2">
        <Input value={slide.image || ''} onChange={(e) => onUpdate({ image: e.target.value })} placeholder={t('pb.content.imagePlaceholder')} />
        <label className="inline-flex items-center gap-2 rounded-md border border-input px-3 text-sm cursor-pointer hover:bg-accent shrink-0">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">{uploading ? t('pb.saving') : t('pb.content.upload')}</span>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
        </label>
      </div>
      {slide.image ? <Button variant="ghost" size="sm" className="text-destructive gap-1.5" onClick={() => onUpdate({ image: '' })}><Trash2 className="h-3.5 w-3.5" />{t('pb.content.deleteSlide')}</Button> : null}
    </div>
  );
}

export default function SlideEditor({ slide, presentation, onUpdate, onUpdateReferences }) {
  const { t } = useApp();
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('pb.content.editor')}</p>
      <div className="space-y-2">
        <Label>{t('pb.content.slideTitle')}</Label>
        <Input value={slide.title} onChange={(e) => onUpdate({ title: e.target.value })} />
      </div>
      {slide.type === 'title' && (
        <div className="space-y-2">
          <Label>{t('pb.topic.subtitle')}</Label>
          <Input value={slide.subtitle || ''} onChange={(e) => onUpdate({ subtitle: e.target.value })} />
        </div>
      )}
      {slide.type === 'content' && (
        <>
          <div className="space-y-2">
            <Label>{t('pb.content.mainText')}</Label>
            <Textarea value={slide.body || ''} onChange={(e) => onUpdate({ body: e.target.value })} rows={3} />
          </div>
          <BulletsEditor slide={slide} onUpdate={onUpdate} />
          <ImageEditor slide={slide} onUpdate={onUpdate} />
        </>
      )}
      {slide.type === 'references' && <ReferencesEditor presentation={presentation} onUpdateReferences={onUpdateReferences} />}
      <div className="space-y-2">
        <Label>{t('pb.content.notes')}</Label>
        <Textarea value={slide.notes || ''} onChange={(e) => onUpdate({ notes: e.target.value })} rows={2} />
      </div>
    </div>
  );
}