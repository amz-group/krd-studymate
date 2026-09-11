import { useState } from 'react';
import { FileText, FileType2, Download, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { sanitizeFileName } from '@/lib/reportModel';
import { exportReportPdf } from '@/lib/exportReportPdf';
import { exportReportDocx } from '@/lib/exportReportDocx';

export default function ReportExportDialog({ open, project, onClose, onFlush }) {
  const { t } = useApp();
  const [busy, setBusy] = useState(null); // 'pdf' | 'docx' | null
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(null);

  const doc = project.content;
  const baseName = sanitizeFileName(doc.studentInfo?.title || project.name);

  const runPdf = async () => {
    setBusy('pdf'); setDone(null); setProgress(t('export.preparing'));
    try {
      onFlush?.();
      await exportReportPdf(doc, `${baseName}.pdf`, (n, total) => setProgress(t('export.slideProgress').replace('{n}', n).replace('{total}', total)));
      setDone('pdf');
    } catch (e) { console.error(e); setProgress(t('export.error')); }
    finally { setBusy(null); }
  };

  const runDocx = async () => {
    setBusy('docx'); setDone(null); setProgress(t('export.preparing'));
    try {
      onFlush?.();
      await exportReportDocx(doc, `${baseName}.docx`, (stage) => setProgress(stage === 'preparing' ? t('export.preparing') : stage === 'packing' ? t('export.finalizing') : ''));
      setDone('docx');
    } catch (e) { console.error(e); setProgress(t('export.error')); }
    finally { setBusy(null); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !busy) { setDone(null); setProgress(''); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('rep.export.title')}</DialogTitle>
          <DialogDescription>{t('rep.export.subtitle')}</DialogDescription>
        </DialogHeader>

        {busy && (
          <div className="flex items-center gap-2 rounded-md bg-accent/50 px-3 py-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{progress || t('export.preparing')}</span>
          </div>
        )}
        {done && !busy && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4" /> {t('export.ready')}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-border p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center"><FileText className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold">PDF</p>
              <p className="text-xs text-muted-foreground">{t('rep.export.pdfDesc')}</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={runPdf} disabled={!!busy}>
              {busy === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {t('rep.export.downloadPdf')}
            </Button>
          </div>
          <div className="rounded-lg border border-border p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center"><FileType2 className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Word (.docx)</p>
              <p className="text-xs text-muted-foreground">{t('rep.export.docxDesc')}</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={runDocx} disabled={!!busy}>
              {busy === 'docx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {t('rep.export.downloadDocx')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}