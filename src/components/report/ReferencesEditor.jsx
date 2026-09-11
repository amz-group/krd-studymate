import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const styles = [
  { id: 'apa', key: 'rep.ref.apa' },
  { id: 'ieee', key: 'rep.ref.ieee' },
  { id: 'simple', key: 'rep.ref.simple' },
];

export default function ReferencesEditor({ t, doc, onChange }) {
  const refs = doc.references;
  const set = (patch) => onChange({ references: { ...refs, ...patch } });
  const setItem = (i, patch) => {
    const items = refs.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    set({ items });
  };
  const addItem = () => set({ items: [...refs.items, { author: '', title: '', year: '', publisher: '', link: '' }] });
  const removeItem = (i) => set({ items: refs.items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t('rep.ref.style')}</Label>
        <div className="flex gap-1.5">
          {styles.map((s) => (
            <button key={s.id} onClick={() => set({ style: s.id })}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${refs.style === s.id ? 'border-primary bg-accent' : 'border-border'}`}>
              {t(s.key)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {refs.items.map((it, i) => (
          <div key={i} className="rounded-md border border-border p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground">{i + 1}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
            <Input placeholder={t('rep.ref.author')} value={it.author} onChange={(e) => setItem(i, { author: e.target.value })} className="h-7 text-xs" />
            <Input placeholder={t('rep.ref.title')} value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} className="h-7 text-xs" />
            <div className="grid grid-cols-2 gap-1.5">
              <Input placeholder={t('rep.ref.year')} value={it.year} onChange={(e) => setItem(i, { year: e.target.value })} className="h-7 text-xs" />
              <Input placeholder={t('rep.ref.publisher')} value={it.publisher} onChange={(e) => setItem(i, { publisher: e.target.value })} className="h-7 text-xs" />
            </div>
            <Input placeholder={t('rep.ref.link')} value={it.link} onChange={(e) => setItem(i, { link: e.target.value })} className="h-7 text-xs" />
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full h-8 gap-1.5" onClick={addItem}><Plus className="h-3.5 w-3.5" /> {t('rep.ref.add')}</Button>
    </div>
  );
}