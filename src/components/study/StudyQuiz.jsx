import { useState } from 'react';
import { ClipboardCheck, RefreshCw, Loader2, Check, X, RotateCcw, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/AppContext';

const rid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const LENGTHS = [5, 10, 15, 20];

export default function StudyQuiz({ content, sourceText, rLabel, onGenerate, onResult, focus }) {
  const { t, dir } = useApp();
  const [type, setType] = useState('mc');
  const [length, setLength] = useState(10);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // index -> answer
  const [submitted, setSubmitted] = useState({}); // index -> bool
  const [selfGrade, setSelfGrade] = useState({}); // index -> 'correct'|'review'
  const [done, setDone] = useState(false);

  const start = () => {
    const len = length === 'custom' ? Math.min(30, Math.max(1, parseInt(custom) || 5)) : length;
    setBusy(true);
    setTimeout(() => {
      const res = onGenerate(type, len) || [];
      setItems(res);
      setBusy(false);
      setIdx(0); setAnswers({}); setSubmitted({}); setSelfGrade({}); setDone(false);
      if (!res.length) { /* not enough */ }
    }, 50);
  };

  const q = items?.[idx];

  const submit = () => {
    setSubmitted((s) => ({ ...s, [idx]: true }));
  };
  const next = () => { if (idx < items.length - 1) { setIdx(idx + 1); } else recordAndDone(); };
  const finish = () => recordAndDone();

  const score = () => {
    if (!items) return { correct: 0, total: items?.length || 0, review: 0, pct: 0 };
    let correct = 0, review = 0;
    items.forEach((it, i) => {
      if (it.type === 'sa') {
        if (selfGrade[i] === 'correct') correct++;
        else if (selfGrade[i] === 'review') review++;
      } else {
        if (answers[i] === it.answer) correct++;
        else if (answers[i] !== undefined) review++;
      }
    });
    const total = items.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return { correct, total, review, pct };
  };

  const recordAndDone = () => {
    const s = score();
    onResult?.({ id: rid(), date: new Date().toISOString(), type, length: items.length, score: s.correct, total: s.total, percentage: s.pct });
    setDone(true);
  };

  const reset = () => { setItems(null); setDone(false); setIdx(0); setAnswers({}); setSubmitted({}); setSelfGrade({}); };

  // Setup screen
  if (!items && !busy) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">{t('study.quiz.title')}</h2><span className="text-xs text-muted-foreground">· {rLabel}</span></div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('study.quiz.type')}</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {[['mc', 'study.quiz.mc'], ['tf', 'study.quiz.tf'], ['sa', 'study.quiz.sa'], ['mixed', 'study.quiz.mixed']].map(([v, k]) => (
                <button key={v} onClick={() => setType(v)} className={`rounded-lg px-3 py-2 text-sm border ${type === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>{t(k)}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('study.quiz.length')}</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {LENGTHS.map((n) => (
                <button key={n} onClick={() => setLength(n)} className={`rounded-lg px-3 py-1.5 text-sm border ${length === n ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>{n}</button>
              ))}
              <button onClick={() => setLength('custom')} className={`rounded-lg px-3 py-1.5 text-sm border ${length === 'custom' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>{t('study.quiz.custom')}</button>
              {length === 'custom' && <Input type="number" min={1} max={30} value={custom} onChange={(e) => setCustom(e.target.value)} className="h-8 w-20 text-sm" placeholder="10" />}
            </div>
          </div>
          <Button className="w-full gap-2" onClick={start}><RefreshCw className="h-4 w-4" /> {t('study.quiz.start')}</Button>
        </div>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t('study.quiz.empty')}</div>
      </div>
    );
  }

  if (busy) return <div className="flex items-center gap-2 text-sm text-muted-foreground py-10"><Loader2 className="h-4 w-4 animate-spin" /> {t('study.quiz.generating')}</div>;

  if (items && !items.length) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t('study.quiz.notEnough')}</div>
        <Button variant="outline" size="sm" onClick={reset}>{t('study.common.back')}</Button>
      </div>
    );
  }

  // Result
  if (done) {
    const s = score();
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /><h2 className="text-lg font-semibold">{t('study.quiz.result')}</h2></div>
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="text-4xl font-bold text-primary">{s.correct} / {s.total}</div>
          <div className="text-lg text-muted-foreground mt-1">{s.pct}%</div>
          <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
            <div className="rounded-lg bg-green-100 dark:bg-green-500/15 p-3"><div className="font-semibold text-green-700 dark:text-green-400">{s.correct}</div><div className="text-xs text-muted-foreground">{t('study.quiz.correctAns')}</div></div>
            <div className="rounded-lg bg-red-100 dark:bg-red-500/15 p-3"><div className="font-semibold text-red-700 dark:text-red-400">{s.total - s.correct - s.review}</div><div className="text-xs text-muted-foreground">{t('study.quiz.incorrectAns')}</div></div>
            <div className="rounded-lg bg-amber-100 dark:bg-amber-500/15 p-3"><div className="font-semibold text-amber-700 dark:text-amber-400">{s.review}</div><div className="text-xs text-muted-foreground">{t('study.quiz.reviewAns')}</div></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => { setDone(false); setIdx(0); }}>{t('study.quiz.reviewAnswers')}</Button>
          <Button variant="outline" size="sm" onClick={() => { setItems(null); setDone(false); }}>{t('study.quiz.newQuiz')}</Button>
          <Button size="sm" className="gap-2" onClick={start}><RefreshCw className="h-4 w-4" /> {t('study.quiz.retry')}</Button>
        </div>
      </div>
    );
  }

  // Play
  const isSubmitted = submitted[idx];
  const ans = answers[idx];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('study.quiz.ofN', { n: idx + 1, total: items.length })}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{t(`study.quiz.${q.type}`)}</span>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <p className="font-medium" dir={dir}>{q.question}</p>

        {q.type === 'mc' && (
          <div className="space-y-2">
            {q.options.map((opt) => {
              const selected = ans === opt;
              const correct = isSubmitted && opt === q.answer;
              const wrong = isSubmitted && selected && opt !== q.answer;
              return (
                <button key={opt} disabled={isSubmitted} onClick={() => setAnswers({ ...answers, [idx]: opt })}
                  className={`w-full text-start rounded-lg border p-3 text-sm flex items-center justify-between ${correct ? 'border-green-500 bg-green-100 dark:bg-green-500/15' : wrong ? 'border-red-500 bg-red-100 dark:bg-red-500/15' : selected ? 'border-primary bg-accent' : 'border-border hover:bg-accent'}`} dir={dir}>
                  <span>{opt}</span>
                  {correct && <Check className="h-4 w-4 text-green-600" />}{wrong && <X className="h-4 w-4 text-red-600" />}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'tf' && (
          <div className="flex gap-2">
            {[true, false].map((v) => {
              const selected = ans === v;
              const correct = isSubmitted && v === q.answer;
              const wrong = isSubmitted && selected && v !== q.answer;
              return (
                <button key={String(v)} disabled={isSubmitted} onClick={() => setAnswers({ ...answers, [idx]: v })}
                  className={`flex-1 rounded-lg border p-3 text-sm font-medium ${correct ? 'border-green-500 bg-green-100 dark:bg-green-500/15' : wrong ? 'border-red-500 bg-red-100 dark:bg-red-500/15' : selected ? 'border-primary bg-accent' : 'border-border hover:bg-accent'}`}>
                  {v ? t('study.quiz.true') : t('study.quiz.false')}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'sa' && (
          <div className="space-y-2">
            <Input value={ans || ''} disabled={isSubmitted} onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })} placeholder={t('study.quiz.answerPh')} dir={dir} />
            {isSubmitted && (
              <div className="rounded-lg bg-accent/50 p-3 text-sm space-y-2" dir={dir}>
                <div><b>{t('study.quiz.reference')}:</b> {q.answer}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant={selfGrade[idx] === 'correct' ? 'default' : 'outline'} className="gap-1.5" onClick={() => setSelfGrade({ ...selfGrade, [idx]: 'correct' })}><Check className="h-4 w-4" /> {t('study.quiz.gotIt')}</Button>
                  <Button size="sm" variant={selfGrade[idx] === 'review' ? 'secondary' : 'outline'} className="gap-1.5" onClick={() => setSelfGrade({ ...selfGrade, [idx]: 'review' })}><RotateCcw className="h-4 w-4" /> {t('study.quiz.needReview')}</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {isSubmitted && q.type !== 'sa' && (
          <div className={`text-sm font-medium ${ans === q.answer ? 'text-green-600' : 'text-red-600'}`}>
            {ans === q.answer ? `✓ ${t('study.quiz.correct')}` : `✗ ${t('study.quiz.incorrect')} — ${t('study.quiz.reference')}: ${q.type === 'tf' ? (q.answer ? t('study.quiz.true') : t('study.quiz.false')) : q.answer}`}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {!isSubmitted ? (
          <Button className="gap-2" disabled={ans === undefined} onClick={submit}>{t('study.quiz.submit')}</Button>
        ) : (
          <Button className="gap-2" onClick={next}>{idx < items.length - 1 ? t('study.quiz.next') : t('study.quiz.finish')} <ChevronRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></Button>
        )}
      </div>
    </div>
  );
}