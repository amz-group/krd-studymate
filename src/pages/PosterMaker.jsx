import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { getProject, saveProject, createId, nowISO } from '@/lib/db';
import { useProjects } from '@/lib/useProjects';
import {
  normalizePosterContent, createNewPosterContent, posterSizes, makeCustomSize,
  buildPosterFromTemplate, buildExamplePoster, posterTemplates, posterExamples,
} from '@/lib/posterModel';
import PosterEditor from '@/components/poster/PosterEditor';
import ScaledSlide from '@/components/presentation/editor/ScaledSlide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Image as ImageIcon, LayoutTemplate, FilePlus2, BookOpen, Trash2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PosterMaker() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { t } = useApp();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) { setInitial(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const proj = await getProject(id);
      if (proj && proj.type === 'poster') {
        setInitial({ ...proj, content: normalizePosterContent(proj.content, t) });
      } else {
        setInitial(null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (id && loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (id && initial) {
    return (
      <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-4rem)]">
        <PosterEditor key={initial.id} initial={initial} onExit={() => navigate('/poster-maker')} />
      </div>
    );
  }
  return <PosterStartPage />;
}

function PosterStartPage() {
  const { t, documentLanguage } = useApp();
  const navigate = useNavigate();
  const { projects, remove } = useProjects();
  const [overlay, setOverlay] = useState(null); // 'blank' | 'template' | 'example'

  const posters = useMemo(() => projects.filter((p) => p.type === 'poster'), [projects]);

  const createBlank = async (size) => {
    const content = createNewPosterContent(size, documentLanguage, t);
    const proj = { id: createId(), name: t('poster.untitled'), type: 'poster', status: 'draft', content, created_date: nowISO(), updated_date: nowISO() };
    await saveProject(proj);
    navigate(`/poster-maker?id=${proj.id}`);
  };
  const createFromTemplate = async (tpl, size) => {
    const built = buildPosterFromTemplate(tpl, size, t);
    const content = { size, language: documentLanguage, background: built.background, elements: built.elements, templateId: tpl.id };
    const proj = { id: createId(), name: tpl.name, type: 'poster', status: 'draft', content, created_date: nowISO(), updated_date: nowISO() };
    await saveProject(proj);
    navigate(`/poster-maker?id=${proj.id}`);
  };
  const createFromExample = async (ex) => {
    const built = buildExamplePoster(ex, t);
    const content = { size: built.size, language: documentLanguage, background: built.background, elements: built.elements, templateId: built.templateId };
    const proj = { id: createId(), name: ex.name, type: 'poster', status: 'draft', content, created_date: nowISO(), updated_date: nowISO() };
    await saveProject(proj);
    navigate(`/poster-maker?id=${proj.id}`);
  };

  const options = [
    { id: 'template', icon: LayoutTemplate, title: t('poster.start.template'), desc: t('poster.start.template.desc'), color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
    { id: 'blank', icon: FilePlus2, title: t('poster.start.blank'), desc: t('poster.start.blank.desc'), color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400' },
    { id: 'example', icon: BookOpen, title: t('poster.start.example'), desc: t('poster.start.example.desc'), color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  ];

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">{t('poster.create')}</h1>
            <p className="text-sm text-muted-foreground">{t('poster.create.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {options.map((o) => (
          <button key={o.id} onClick={() => setOverlay(o.id)}
            className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 card-shadow transition-all hover:border-primary/40 hover:-translate-y-0.5 text-start">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl mb-4', o.color)}>
              <o.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">{o.title}</h3>
            <p className="text-sm text-muted-foreground">{o.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">{t('poster.existing')}</h2>
        {posters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {t('poster.existing.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posters.map((p) => (
              <PosterThumb key={p.id} project={p} onOpen={() => navigate(`/poster-maker?id=${p.id}`)} onDelete={() => remove(p.id)} />
            ))}
          </div>
        )}
      </div>

      {overlay === 'blank' && <BlankDialog onClose={() => setOverlay(null)} onConfirm={createBlank} />}
      {overlay === 'template' && <TemplateDialog onClose={() => setOverlay(null)} onConfirm={createFromTemplate} />}
      {overlay === 'example' && <ExampleDialog onClose={() => setOverlay(null)} onConfirm={createFromExample} />}
    </div>
  );
}

function PosterThumb({ project, onOpen, onDelete }) {
  const c = project.content;
  const size = c?.size || { w: 794, h: 1123 };
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden card-shadow">
      <button onClick={onOpen} className="block w-full overflow-hidden border-b border-border bg-muted/30">
        <ScaledSlide slide={c || { background: { type: 'solid', color: '#fff' }, elements: [] }} baseW={size.w} baseH={size.h} language={c?.language || 'en'} className="w-full" />
      </button>
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="text-sm font-medium truncate">{project.name}</p>
        <button onClick={onDelete} title="Delete" className="text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BlankDialog({ onClose, onConfirm }) {
  const { t } = useApp();
  const [sizeId, setSizeId] = useState('a4-portrait');
  const [custom, setCustom] = useState({ w: 1000, h: 1000, unit: 'px' });
  const confirm = () => {
    if (sizeId === 'custom') onConfirm(makeCustomSize(custom.w, custom.h, custom.unit));
    else { const s = posterSizes.find((x) => x.id === sizeId); if (s) onConfirm(s); }
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('poster.size.title')}</DialogTitle>
          <DialogDescription>{t('poster.create.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {posterSizes.map((s) => (
            <button key={s.id} onClick={() => setSizeId(s.id)}
              className={cn('rounded-lg border p-3 text-start', sizeId === s.id ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50')}>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.w} × {s.h} px</p>
            </button>
          ))}
          <button onClick={() => setSizeId('custom')}
            className={cn('rounded-lg border p-3 text-start', sizeId === 'custom' ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50')}>
            <p className="text-sm font-medium">{t('poster.size.custom')}</p>
            <p className="text-xs text-muted-foreground">px · mm · cm</p>
          </button>
        </div>
        {sizeId === 'custom' && (
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-muted-foreground">{t('poster.size.width')}</label><Input type="number" value={custom.w} onChange={(e) => setCustom((c) => ({ ...c, w: +e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">{t('poster.size.height')}</label><Input type="number" value={custom.h} onChange={(e) => setCustom((c) => ({ ...c, h: +e.target.value }))} /></div>
            </div>
            <div className="flex gap-1">
              {['px', 'mm', 'cm'].map((u) => (
                <button key={u} onClick={() => setCustom((c) => ({ ...c, unit: u }))}
                  className={cn('flex-1 rounded-md border px-2 py-1 text-xs', custom.unit === u ? 'border-primary bg-accent' : 'border-border')}>{u}</button>
              ))}
            </div>
          </div>
        )}
        <Button className="w-full" onClick={confirm}>{t('poster.create')}</Button>
      </DialogContent>
    </Dialog>
  );
}

function TemplateDialog({ onClose, onConfirm }) {
  const { t } = useApp();
  const [sizeId, setSizeId] = useState('a4-portrait');
  const size = sizeId === 'custom' ? makeCustomSize(1000, 1000, 'px') : (posterSizes.find((s) => s.id === sizeId) || posterSizes[0]);
  const cats = [
    { id: 'academic', label: t('poster.template.category.academic') },
    { id: 'technology', label: t('poster.template.category.technology') },
    { id: 'general', label: t('poster.template.category.general') },
  ];
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('poster.template.choose')}</DialogTitle>
          <DialogDescription>{t('poster.create.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{t('poster.size.title')}:</span>
          <select value={sizeId} onChange={(e) => setSizeId(e.target.value)} className="h-8 rounded-md border border-input bg-transparent text-xs px-2">
            {posterSizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        {cats.map((cat) => (
          <div key={cat.id} className="mb-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{cat.label}</p>
            <div className="grid grid-cols-2 gap-3">
              {posterTemplates.filter((tpl) => tpl.category === cat.id).map((tpl) => {
                const preview = buildPosterFromTemplate(tpl, { w: 600, h: 800 }, t);
                return (
                  <div key={tpl.id} className="rounded-xl border border-border p-2 space-y-2">
                    <p className="text-xs font-medium px-1">{tpl.name}</p>
                    <ScaledSlide slide={preview} baseW={600} baseH={800} language="en" className="w-full rounded border border-border overflow-hidden" />
                    <Button size="sm" className="w-full" onClick={() => onConfirm(tpl, size)}>{t('poster.template.use')}</Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}

function ExampleDialog({ onClose, onConfirm }) {
  const { t } = useApp();
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('poster.example.choose')}</DialogTitle>
          <DialogDescription>{t('poster.create.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posterExamples.map((ex) => {
            const built = buildExamplePoster(ex, t);
            return (
              <div key={ex.id} className="rounded-xl border border-border p-3 space-y-2">
                <p className="text-sm font-medium">{ex.name}</p>
                <ScaledSlide slide={built} baseW={built.size.w} baseH={built.size.h} language="en" className="w-full rounded border border-border overflow-hidden" />
                <Button size="sm" className="w-full" onClick={() => onConfirm(ex)}>{t('poster.example.use')}</Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}