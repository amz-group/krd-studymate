import { useState } from 'react';
import { Download, FileText, FileType, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, FileImage } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { exportToPptx } from '@/lib/exportPptx';
import { exportToPdf } from '@/lib/exportPdf';
import { languageLabel } from '@/lib/exportUtils';

export default function ExportDialog({ open, presentation, onClose }) {
  const { t } = useApp();
  const [busy, setBusy] = useState(null);
  const [progress, setProgress] = useState(null);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);

  const content = presentation?.content || {};
  const slides = content.slides || [];
  const ratio = content.ratio || '16:9';
  const language = content.language || 'en';
  const title = presentation?.title || t('pb.untitled');

  const run = async (type) => {
    if (busy) return;
    setBusy(type);
    setDone(null);
    setError(null);
    setProgress({ slide: 0, total: slides.length, status: 'preparing' });
    try {
      const onProgress = (p) => setProgress(p);
      if (type === 'pptx') await exportToPptx(presentation, onProgress);
      else await exportToPdf(presentation, onProgress);
      setDone(type);
      setProgress({ slide: slides.length, total: slides.length, status: 'done' });
    } catch (e) {
      console.error('[KRD StudyMate] Export failed:', e);
      setError(t('export.error'));
    } finally {
      setBusy(null);
    }
  };

  const handleClose = () => {
    if (busy) return;
    setBusy(null);
    setProgress(null);
    setDone(null);
    setError(null);
    onClose();
  };

  const pct = progress && progress.total ? Math.round((progress.slide / progress.total) * 100) : 0;
  const statusText = progress
    ? progress.status === 'preparing' ? t('export.preparing')
      : progress.status === 'done' ? t('export.ready')
      : progress.status === 'finalizing' ? t('export.finalizing')
      : t('export.slideProgress').replace('{n}', progress.slide).replace('{total}', progress.total)
    : '';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-primary" /> {t('export.title')}</DialogTitle>
          <DialogDescription>{t('export.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <SummaryRow label={t('export.summary.title')} value={title} />
          <SummaryRow label={t('export.summary.slides')} value={String(slides.length)} />
          <SummaryRow label={t('export.summary.ratio')} value={ratio} />
          <SummaryRow label={t('export.summary.language')} value={languageLabel[language] || language} />
        </div>

        <div className="space-y-2">
          <OptionCard
            icon={FileText} title={t('export.pptx')} desc={t('export.pptx.desc')} btn={t('export.pptx.btn')}
            onClick={() => run('pptx')} disabled={!!busy} busy={busy === 'pptx'} done={done === 'pptx'} t={t}
          />
          <OptionCard
            icon={FileType} title={t('export.pdf')} desc={t('export.pdf.desc')} btn={t('export.pdf.btn')}
            onClick={() => run('pdf')} disabled={!!busy} busy={busy === 'pdf'} done={done === 'pdf'} t={t}
          />
          <div className="grid grid-cols-2 gap-2">
            <DisabledCard icon={ImageIcon} label={t('export.png.disabled')} />
            <DisabledCard icon={FileImage} label={t('export.jpg.disabled')} />
          </div>
        </div>

        {(busy || done || error) && (
          <div className="space-y-2 pt-1">
            {error ? (
              <div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</div>
            ) : done ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4 shrink-0" /> {t('export.ready')}</div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin shrink-0" /> {statusText}</div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function OptionCard({ icon: Icon, title, desc, btn, onClick, disabled, busy, done, t }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Button size="sm" className="shrink-0 gap-1.5" onClick={onClick} disabled={disabled}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {busy ? t('export.exporting') : btn}
      </Button>
    </div>
  );
}

function DisabledCard({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-2.5 opacity-60">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}