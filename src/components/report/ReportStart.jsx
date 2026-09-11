import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, FolderOpen, Trash2, LayoutTemplate, Sparkles, FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/lib/AppContext';
import { useProjects } from '@/lib/useProjects';
import { saveProject } from '@/lib/db';
import { createReportProject, getPageSize } from '@/lib/reportModel';
import { reportTemplates, reportExamples, documentCategories } from '@/lib/reportAssets';
import { cn } from '@/lib/utils';

export default function ReportStart() {
  const { t, dir } = useApp();
  const navigate = useNavigate();
  const { projects, remove } = useProjects();
  const reports = projects.filter((p) => p.type === 'report');

  const [category, setCategory] = useState('report');
  const [entry, setEntry] = useState('blank'); // blank | template | example
  const [templateId, setTemplateId] = useState('standard');
  const [exampleId, setExampleId] = useState('it-cybersecurity');
  const [language, setLanguage] = useState('en');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subject, setSubject] = useState('');
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) { window.alert(t('rep.titleRequired')); return; }
    const proj = createReportProject({
      title: title.trim(), subtitle, subject, category, language,
      templateId: entry === 'template' ? templateId : 'standard',
      exampleId: entry === 'example' ? exampleId : null,
      blank: entry === 'blank',
      studentInfo: { title: title.trim(), subtitle, subject, university, students: [{ name: studentName, id: '' }] },
    });
    await saveProject(proj);
    navigate(`/report-assignment?id=${proj.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('rep.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('rep.subtitle')}</p>
      </header>

      {/* Category */}
      <section className="mb-6">
        <p className="text-sm font-semibold mb-3">{t('rep.createQuestion')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {documentCategories.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={cn('rounded-xl border p-3 text-sm text-start', category === c.id ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50')}>
              {t(c.key)}
            </button>
          ))}
        </div>
      </section>

      {/* Entry method */}
      <section className="mb-6">
        <p className="text-sm font-semibold mb-3">{t('rep.startMethod')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'blank', icon: FilePlus2, key: 'rep.start.blank', desc: 'rep.start.blank.desc' },
            { id: 'template', icon: LayoutTemplate, key: 'rep.start.template', desc: 'rep.start.template.desc' },
            { id: 'example', icon: Sparkles, key: 'rep.start.example', desc: 'rep.start.example.desc' },
          ].map((e) => (
            <button key={e.id} onClick={() => setEntry(e.id)}
              className={cn('rounded-xl border p-4 text-start flex flex-col gap-1', entry === e.id ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50')}>
              <e.icon className="h-5 w-5 text-primary mb-1" />
              <span className="text-sm font-semibold">{t(e.key)}</span>
              <span className="text-xs text-muted-foreground">{t(e.desc)}</span>
            </button>
          ))}
        </div>
      </section>

      {entry === 'template' && (
        <section className="mb-6">
          <p className="text-sm font-semibold mb-3">{t('rep.template.choose')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {reportTemplates.map((tpl) => (
              <button key={tpl.id} onClick={() => setTemplateId(tpl.id)}
                className={cn('rounded-lg border p-2 text-start', templateId === tpl.id ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50')}>
                <div className="h-16 rounded mb-2" style={{ background: `linear-gradient(135deg, ${tpl.colors.primary}, ${tpl.colors.accent})` }} />
                <p className="text-xs font-medium">{t(tpl.key)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {entry === 'example' && (
        <section className="mb-6">
          <p className="text-sm font-semibold mb-3">{t('rep.example.choose')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reportExamples.map((ex) => (
              <button key={ex.id} onClick={() => setExampleId(ex.id)}
                className={cn('rounded-xl border p-3 text-start', exampleId === ex.id ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50')}>
                <p className="text-sm font-semibold">{t(ex.key)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('rep.example.use')}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Document info */}
      <section className="mb-6 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-3">{t('rep.info.title')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.info.title')} *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('rep.info.titlePh')} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.info.subtitle')}</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.info.subject')}</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.info.studentName')}</Label>
            <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.info.university')}</Label>
            <Input value={university} onChange={(e) => setUniversity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('rep.language')}</Label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm">
              <option value="en">{t('rep.lang.en')}</option>
              <option value="ku">{t('rep.lang.ku')}</option>
              <option value="ar">{t('rep.lang.ar')}</option>
            </select>
          </div>
        </div>
        <Button className="mt-4 gap-1.5" onClick={handleCreate}><Plus className="h-4 w-4" /> {t('rep.create')}</Button>
      </section>

      {/* Existing */}
      {reports.length > 0 && (
        <section>
          <p className="text-sm font-semibold mb-3">{t('rep.existing')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reports.map((p) => (
              <div key={p.id} className="group rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><FileText className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{t(`rep.type.${p.content?.category || 'report'}`)}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/report-assignment?id=${p.id}`)}><FolderOpen className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}