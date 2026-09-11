import { useState, useEffect } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/AppContext';

export default function StudyExplain({ content, selectedText, onExplain }) {
  const { t, dir } = useApp();
  const [level, setLevel] = useState('student');
  const [source, setSource] = useState(selectedText || '');
  const [result, setResult] = useState('');

  // Keep source synced when text is selected in the document.
  useEffect(() => {
    if (selectedText) setSource(selectedText);
  }, [selectedText]);

  const explain = () => {
    const text = source || selectedText;
    if (!text || !text.trim()) return;
    setResult(onExplain(text, level));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('study.explain.title')}</h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm text-muted-foreground">{t('study.explain.selectFirst')}</p>
        <Textarea rows={4} value={source} onChange={(e) => setSource(e.target.value)} placeholder={t('study.explain.selectFirst')} dir={dir} />
        <div className="flex flex-wrap items-center gap-2">
          {[['verySimple', 'study.explain.verySimple'], ['student', 'study.explain.student'], ['detailed', 'study.explain.detailed']].map(([v, k]) => (
            <button key={v} onClick={() => setLevel(v)} className={`rounded-lg px-3 py-1.5 text-sm border ${level === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>{t(k)}</button>
          ))}
          <Button size="sm" className="gap-2" onClick={explain} disabled={!source.trim()}><Wand2 className="h-4 w-4" /> {t('study.explain.explain')}</Button>
        </div>
      </div>

      {result && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('study.explain.result')}</label>
          <Textarea rows={6} value={result} onChange={(e) => setResult(e.target.value)} dir={dir} className="text-sm leading-7" />
          <p className="text-xs text-muted-foreground">{t('study.explain.localNote')}</p>
        </div>
      )}
    </div>
  );
}