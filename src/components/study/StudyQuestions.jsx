import { useState } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, RefreshCw, Loader2, Eye, EyeOff, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';

const TYPES = ['short', 'definition', 'concept', 'review'];

export default function StudyQuestions({ content, sourceText, rLabel, onGenerate, onUpdate, focus }) {
  const { t, dir } = useApp();
  const [types, setTypes] = useState(['short', 'definition', 'concept']);
  const [busy, setBusy] = useState(false);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const qs = content.questions || [];

  const generate = () => {
    setBusy(true);
    setTimeout(() => { onGenerate(types); setBusy(false); setIdx(0); setShow(false); }, 50);
  };

  const toggleType = (tp) => setTypes((prev) => prev.includes(tp) ? prev.filter((x) => x !== tp) : [...prev, tp]);

  const q = qs[idx];
  const setQ = (patch) => onUpdate(qs.map((x, i) => i === idx ? { ...x, ...patch } : x));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('study.q.title')}</h2>
        <span className="text-xs text-muted-foreground">· {rLabel}</span>
      </div>

      {!focus && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">{t('study.q.types')}</span>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((tp) => (
              <button key={tp} onClick={() => toggleType(tp)}
                className={`rounded-full px-3 py-1 text-xs border ${types.includes(tp) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>
                {t(`study.q.${tp}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button variant="default" size="sm" className="gap-2" disabled={busy || !types.length} onClick={generate}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t('study.q.generate')}
      </Button>

      {qs.length === 0 && !busy ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t('study.q.empty')}</div>
      ) : q ? (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('study.q.ofN', { n: idx + 1, total: qs.length })}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{t(`study.q.${q.type}`)}</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="font-medium" dir={dir}>{q.question}</p>
            {show ? (
              <div className="rounded-lg bg-accent/50 p-3 text-sm" dir={dir}>{q.answer}</div>
            ) : (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShow(true)}><Eye className="h-4 w-4" /> {t('study.q.showAnswer')}</Button>
            )}
            {show && (
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShow(false)}><EyeOff className="h-4 w-4" /> {t('study.q.hideAnswer')}</Button>
            )}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Button variant={q.learned ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => setQ({ learned: !q.learned })}>
                <Check className="h-4 w-4" /> {q.learned ? t('study.q.learned') : t('study.q.markLearned')}
              </Button>
              <Button variant={q.needsReview ? 'secondary' : 'outline'} size="sm" className="gap-1.5" onClick={() => setQ({ needsReview: !q.needsReview })}>
                <RotateCcw className="h-4 w-4" /> {t('study.q.needsReview')}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-1.5" disabled={idx === 0} onClick={() => { setIdx(idx - 1); setShow(false); }}><ChevronLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {t('study.q.prev')}</Button>
            <Button variant="outline" size="sm" className="gap-1.5" disabled={idx >= qs.length - 1} onClick={() => { setIdx(idx + 1); setShow(false); }}>{t('study.q.next')} <ChevronRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></Button>
          </div>
        </>
      ) : null}
    </div>
  );
}