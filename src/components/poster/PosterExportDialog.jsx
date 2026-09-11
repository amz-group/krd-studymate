import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { exportPosterPng, exportPosterPdf } from '@/lib/exportPoster';

export default function PosterExportDialog({ open, poster, onClose }) {
  const { t } = useApp();
  const [busy, setBusy] = useState(null);
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  const run = async (kind) => {
    setBusy(kind); setError(''); setDone(null); setProgress(t('export.preparing'));
    try {
      const onProg = (p) => setProgress(p.status === 'finalizing' ? t('export.finalizing') : t('export.exporting'));
      if (kind === 'png') await exportPosterPng(poster, onProg);
      else await exportPosterPdf(poster, onProg);
      setDone(kind);
    } catch (e) {
      console.error(e);
      setError(t('export.error'));
    } finally {
      setBusy(null);
      setTimeout(() => setProgress(''), 800);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !busy) { onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('poster.export.title')}</DialogTitle>
          <DialogDescription>{t('poster.export.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2"><FileImage className="h-5 w-5 text-primary" /><span className="font-medium text-sm">PNG</span></div>
            <p className="text-xs text-muted-foreground">{t('poster.export.png.desc')}</p>
            <Button className="w-full" disabled={!!busy} onClick={() => run('png')}>
              {busy === 'png' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {t('poster.export.png')}
            </Button>
          </div>
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><span className="font-medium text-sm">PDF</span></div>
            <p className="text-xs text-muted-foreground">{t('poster.export.pdf.desc')}</p>
            <Button className="w-full" disabled={!!busy} onClick={() => run('pdf')}>
              {busy === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {t('poster.export.pdf')}
            </Button>
          </div>
        </div>
        {progress && <p className="text-xs text-muted-foreground text-center mt-2">{progress}</p>}
        {done && <p className="text-xs text-green-600 dark:text-green-400 text-center">{t('export.ready')}</p>}
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}