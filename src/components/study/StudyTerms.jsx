import { useState } from 'react';
import { BookMarked, RefreshCw, Loader2, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/AppContext';

export default function StudyTerms({ content, sourceText, rLabel, onGenerate, onUpdate, onToFlashcard, focus }) {
  const { t, dir } = useApp();
  const [busy, setBusy] = useState(false);
  const terms = content.terms || [];

  const generate = () => { setBusy(true); setTimeout(() => { onGenerate(); setBusy(false); }, 50); };
  const update = (id, patch) => onUpdate(terms.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id) => onUpdate(terms.filter((x) => x.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookMarked className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('study.terms.title')}</h2>
        <span className="text-xs text-muted-foreground">· {rLabel}</span>
      </div>
      <Button variant="default" size="sm" className="gap-2" disabled={busy} onClick={generate}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t('study.terms.generate')}
      </Button>
      {terms.length === 0 && !busy ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t('study.terms.empty')}</div>
      ) : (
        <div className="space-y-2">
          {terms.map((tm) => (
            <div key={tm.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={tm.term} onChange={(e) => update(tm.id, { term: e.target.value })} className="font-medium text-sm h-8" dir={dir} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(tm.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <textarea value={tm.explanation} onChange={(e) => update(tm.id, { explanation: e.target.value })}
                placeholder={t('study.terms.noExpl')} dir={dir}
                className="w-full bg-transparent text-sm text-muted-foreground outline-none resize-none min-h-[40px]" />
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onToFlashcard(tm.term, tm.explanation || tm.term)}>
                <Layers className="h-4 w-4" /> {t('study.terms.toFlashcard')}
              </Button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{t('study.common.localDesc')}</p>
    </div>
  );
}