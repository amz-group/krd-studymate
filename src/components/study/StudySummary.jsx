import { useState } from 'react';
import { ScrollText, Copy, Save, RefreshCw, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/AppContext';

export default function StudySummary({ content, sourceText, rLabel, onGenerate, onSave, focus }) {
  const { t } = useApp();
  const [type, setType] = useState(content.summary?.type || 'standard');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const summary = content.summary || { text: '' };

  const generate = (tp) => {
    setType(tp);
    setBusy(true);
    setTimeout(() => {
      onGenerate(tp);
      setBusy(false);
    }, 50);
  };

  const copy = () => {
    navigator.clipboard?.writeText(summary.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  const save = () => { onSave(summary.text); setSaved(true); setTimeout(() => setSaved(false), 1200); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ScrollText className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('study.sum.title')}</h2>
        <span className="text-xs text-muted-foreground">· {rLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {['short', 'standard', 'detailed'].map((tp) => (
          <Button key={tp} variant={type === tp ? 'default' : 'outline'} size="sm" disabled={busy} onClick={() => generate(tp)}>
            {t(`study.sum.${tp}`)}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="gap-2" disabled={busy} onClick={() => generate(type)}>
          <RefreshCw className="h-4 w-4" /> {t('study.sum.regenerate')}
        </Button>
      </div>

      {busy ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> {t('study.sum.generating')}</div>
      ) : summary.text ? (
        <>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditing(!editing)}>
              {editing ? t('study.common.save') : t('study.sum.edit')}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={copy}>
              {copied ? <><Check className="h-4 w-4" /> {t('study.sum.copied')}</> : <><Copy className="h-4 w-4" /> {t('study.sum.copy')}</>}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={save}>
              {saved ? <><Check className="h-4 w-4" /> {t('study.sum.saved')}</> : <><Save className="h-4 w-4" /> {t('study.sum.save')}</>}
            </Button>
          </div>
          {editing ? (
            <Textarea rows={14} value={summary.text} onChange={(e) => onSave(e.target.value)} className="text-sm leading-7" />
          ) : (
            <div className="whitespace-pre-wrap rounded-xl border border-border bg-card p-5 text-sm leading-7">{summary.text}</div>
          )}
          <p className="text-xs text-muted-foreground">{t('study.sum.localNote')}</p>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t('study.sum.empty')}</div>
      )}
    </div>
  );
}