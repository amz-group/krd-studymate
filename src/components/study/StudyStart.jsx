import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ClipboardPaste, PenLine, ArrowLeft, FileText, Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/AppContext';
import { useProjects } from '@/lib/useProjects';
import { createStudyProject } from '@/lib/studyModel';
import { saveProject } from '@/lib/db';
import { extractPdf } from '@/lib/studyPdf';

export default function StudyStart({ onCreated }) {
  const { t, dir } = useApp();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const studyProjects = projects.filter((p) => p.type === 'study');
  const recent = studyProjects.slice(0, 6);

  const [mode, setMode] = useState(null); // 'upload' | 'paste' | 'text'
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState(''); // progress message
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const openProject = (p) => navigate(`/study-assistant?id=${p.id}`);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError(t('study.upload.unsupported'));
      return;
    }
    setError('');
    setBusy(true);
    setStatus(t('study.upload.processing'));
    try {
      const res = await extractPdf(file, (i, total) => {
        setStatus(t('study.upload.reading', { n: i, total }));
      });
      if (!res.text.trim()) {
        setError(t('study.upload.noText'));
        setBusy(false);
        return;
      }
      const proj = createStudyProject({
        name: name || file.name.replace(/\.pdf$/i, ''),
        sourceType: 'pdf',
        file: res.fileMeta,
        pages: res.pages,
        text: res.text,
      });
      // init range.to to last page
      proj.content.range.to = res.numPages;
      await saveProject(proj);
      setStatus(t('study.upload.loaded', { n: res.numPages }));
      setBusy(false);
      onCreated(proj);
    } catch (err) {
      setBusy(false);
      setStatus('');
      if (err?.message === 'PROTECTED') setError(t('study.upload.protected'));
      else if (err?.message === 'CORRUPT') setError(t('study.upload.error'));
      else setError(t('study.upload.error'));
    }
  }, [name, onCreated, t]);

  const createFromText = useCallback(async (sourceType) => {
    if (!name.trim()) { setError(t('study.nameRequired')); return; }
    if (!text.trim()) { setError(t('study.nameRequired')); return; }
    setError('');
    setBusy(true);
    const proj = createStudyProject({ name, sourceType, text, pages: [{ index: 0, text }] });
    await saveProject(proj);
    setBusy(false);
    onCreated(proj);
  }, [name, text, onCreated, t]);

  const options = [
    { key: 'upload', icon: Upload, title: t('study.start.upload'), desc: t('study.start.uploadDesc'), accent: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
    { key: 'paste', icon: ClipboardPaste, title: t('study.start.paste'), desc: t('study.start.pasteDesc'), accent: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
    { key: 'text', icon: PenLine, title: t('study.start.text'), desc: t('study.start.textDesc'), accent: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate('/')}>
        <ArrowLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        {t('study.start.back')}
      </Button>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 px-3 py-1 text-xs font-medium mb-3">
          <GraduationCap className="h-3.5 w-3.5" /> {t('study.common.local')}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('study.start.title')}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{t('study.start.subtitle')}</p>
      </div>

      {!mode ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {options.map((o) => {
              const Icon = o.icon;
              return (
                <button key={o.key} onClick={() => setMode(o.key)}
                  className="group flex flex-col items-start text-start rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:border-primary/40 hover:-translate-y-0.5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${o.accent} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{o.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{o.desc}</p>
                </button>
              );
            })}
          </div>

          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t('study.start.recent')}</h2>
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t('study.start.recentEmpty')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent.map((p) => (
                  <button key={p.id} onClick={() => openProject(p)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-start card-shadow hover:border-primary/40 transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{t('study.start.continue')}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 md:p-8 card-shadow">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => { setMode(null); setError(''); setStatus(''); }}>
            <ArrowLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            {t('study.common.back')}
          </Button>

          <h2 className="text-xl font-semibold mb-4">
            {mode === 'upload' ? t('study.upload.title') : mode === 'paste' ? t('study.paste.title') : t('study.text.title')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('study.projectName')}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('study.projectNamePh')} />
            </div>

            {mode === 'upload' ? (
              <div>
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])} />
                <button onClick={() => fileRef.current?.click()} disabled={busy}
                  className="w-full rounded-xl border-2 border-dashed border-border p-10 text-center hover:border-primary/50 transition-colors disabled:opacity-60">
                  {busy ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm">{status}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">{t('study.upload.drop')}</span>
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)}
                  placeholder={mode === 'paste' ? t('study.paste.placeholder') : t('study.text.placeholder')} />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {status && !error && mode === 'upload' && <p className="text-sm text-muted-foreground">{status}</p>}

            {mode !== 'upload' && (
              <Button className="w-full" disabled={busy} onClick={() => createFromText(mode)}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t('study.paste.create')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}