import { useState } from 'react';
import { ListChecks, Plus, Trash2, ArrowUp, ArrowDown, RefreshCw, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/AppContext';

export default function StudyKeyPoints({ content, sourceText, rLabel, onGenerate, onUpdate, focus }) {
  const { t, dir } = useApp();
  const [busy, setBusy] = useState(false);
  const [newPoint, setNewPoint] = useState('');
  const points = content.keyPoints || [];

  const generate = () => {
    setBusy(true);
    setTimeout(() => { onGenerate(); setBusy(false); }, 50);
  };

  const update = (id, text) => onUpdate(points.map((p) => p.id === id ? { ...p, text } : p));
  const remove = (id) => onUpdate(points.filter((p) => p.id !== id));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= points.length) return;
    const arr = [...points];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onUpdate(arr);
  };
  const add = () => {
    if (!newPoint.trim()) return;
    onUpdate([...points, { id: Date.now() + '-' + Math.random().toString(36).slice(2, 6), text: newPoint.trim() }]);
    setNewPoint('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('study.kp.title')}</h2>
        <span className="text-xs text-muted-foreground">· {rLabel}</span>
      </div>

      <Button variant="default" size="sm" className="gap-2" disabled={busy} onClick={generate}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t('study.kp.generate')}
      </Button>

      {points.length === 0 && !busy ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t('study.kp.empty')}</div>
      ) : (
        <ul className="space-y-2">
          {points.map((p, i) => (
            <li key={p.id} className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5">
              <span className="text-primary font-semibold text-sm pt-1.5">•</span>
              <input value={p.text} onChange={(e) => update(p.id, e.target.value)} className="flex-1 bg-transparent text-sm outline-none" dir={dir} />
              <div className="flex items-center gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Input value={newPoint} onChange={(e) => setNewPoint(e.target.value)} placeholder={t('study.kp.placeholder')} dir={dir}
          onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={add}><Plus className="h-4 w-4" /> {t('study.kp.add')}</Button>
      </div>
    </div>
  );
}