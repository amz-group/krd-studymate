import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Undo2, Redo2, Save, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { getProject, saveProject, nowISO } from '@/lib/db';
import { usePresentationState } from '@/lib/usePresentationState';
import { createNewProject, normalizeContent, generateSlides } from '@/lib/presentationModel';
import WizardStepper from '@/components/presentation/WizardStepper';
import TopicStep from '@/components/presentation/steps/TopicStep';
import LanguageStep from '@/components/presentation/steps/LanguageStep';
import SlidesStep from '@/components/presentation/steps/SlidesStep';
import StudentInfoStep from '@/components/presentation/steps/StudentInfoStep';
import ContentStep from '@/components/presentation/steps/ContentStep';
import DesignStep from '@/components/presentation/steps/DesignStep';
import PreviewStep from '@/components/presentation/steps/PreviewStep';
import { Button } from '@/components/ui/button';

const stepKeys = ['pb.step.topic', 'pb.step.language', 'pb.step.slides', 'pb.step.student', 'pb.step.content', 'pb.step.design', 'pb.step.preview'];

function Wizard({ initial }) {
  const { t, autoSave, dir } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(initial.content.step || 0);
  const [projectId] = useState(initial.id);
  const [saveState, setSaveState] = useState('idle');
  const [attempted, setAttempted] = useState(false);
  const { presentation, update, undo, redo, canUndo, canRedo } = usePresentationState(initial);

  // The hook holds the WHOLE project; steps edit presentation *content*. Wrap the
  // whole-project update so step code can treat the updater argument as `content`
  // (e.g. update(c => ({ ...c, topic: {...} }))) and it lands in project.content,
  // never on the project root.
  const updateContent = useCallback((updater) => {
    update((project) => ({
      ...project,
      content: typeof updater === 'function' ? updater(project.content) : { ...project.content, ...updater },
    }));
  }, [update]);

  // Keep the latest state accessible to a stable persist callback so we don't
  // recreate persist on every keystroke (which would churn the auto-save effect).
  const latestRef = useRef({ presentation, step });
  latestRef.current = { presentation, step };

  const persist = useCallback(async (status) => {
    const { presentation: p, step: s } = latestRef.current;
    const proj = {
      id: projectId,
      name: p.content.topic.title?.trim() || t('pb.untitled'),
      type: 'presentation',
      status: status || p.status || 'draft',
      content: { ...p.content, step: s },
      created_date: initial.created_date,
      updated_date: nowISO(),
    };
    await saveProject(proj);
  }, [projectId, t, initial.created_date]);

  // Auto-save (debounced) when enabled. Editing state lives in React; we only
  // write to IndexedDB after the user pauses typing — never on every keystroke.
  useEffect(() => {
    if (!autoSave) return;
    setSaveState('saving');
    const timer = setTimeout(async () => {
      await persist(null);
      setSaveState('saved');
    }, 800);
    return () => clearTimeout(timer);
  }, [presentation, autoSave, persist]);

  // Ensure slides exist when entering the editor from a saved draft.
  useEffect(() => {
    if (presentation.content.slides.length === 0 && step >= 3) {
      updateContent((c) => ({ ...c, slides: generateSlides(c.topic, c.slideCount, t) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canProceed = useMemo(() => {
    if (step === 0) return !!presentation.content.topic.title.trim();
    if (step === 2) { const n = Number(presentation.content.slideCount); return n >= 3 && n <= 30; }
    return true;
  }, [step, presentation]);

  const goNext = async () => {
    if (!canProceed) { setAttempted(true); return; }
    setAttempted(false);
    if (step === 2) {
      updateContent((c) => (c.slides.length === 0 || c.slides.length !== c.slideCount ? { ...c, slides: generateSlides(c.topic, c.slideCount, t) } : c));
    }
    setStep(Math.min(step + 1, 6));
    await persist(null);
  };
  const goBack = async () => { setAttempted(false); setStep((s) => Math.max(0, s - 1)); await persist(null); };
  const jumpTo = (i) => { setAttempted(false); setStep(i); };
  const saveDraft = async () => { await persist('draft'); setSaveState('saved'); setTimeout(() => setSaveState('idle'), 1500); };
  const finish = async () => { await persist('completed'); navigate('/projects'); };

  const steps = [TopicStep, LanguageStep, SlidesStep, StudentInfoStep, ContentStep, DesignStep, PreviewStep];
  const StepComp = steps[step];

  return (
    <div className="flex flex-col">
      <div className="px-4 md:px-6 pt-4 pb-2 border-b border-border">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0"><FileText className="h-4 w-4" /></div>
            <h1 className="text-base font-semibold truncate">{presentation.content.topic.title?.trim() || t('pb.untitled')}</h1>
            {presentation.status === 'draft' && <span className="text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 px-2 py-0.5 shrink-0">{t('pb.draft')}</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label={t('pb.undo')}><Undo2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label={t('pb.redo')}><Redo2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={saveDraft} className="gap-1.5"><Save className="h-4 w-4" />{saveState === 'saved' ? t('pb.saved') : saveState === 'saving' ? t('pb.saving') : t('pb.saveDraft')}</Button>
          </div>
        </div>
        <WizardStepper steps={stepKeys} current={step} onJump={jumpTo} />
      </div>

      <div className="px-4 md:px-6">
        {step === 6
          ? <PreviewStep presentation={presentation} onFinish={finish} />
          : <StepComp presentation={presentation} update={updateContent} />}
        {step !== 6 && attempted && !canProceed && (
          <p className="text-xs text-destructive mt-4 text-center">{step === 0 ? t('pb.topic.titleRequired') : t('pb.slides.invalid')}</p>
        )}
      </div>

      {step !== 6 && (
        <div className="px-4 md:px-6 py-3 border-t border-border flex items-center justify-between gap-3 sticky bottom-0 bg-background">
          <Button variant="ghost" onClick={goBack} disabled={step === 0} className="gap-1.5"><ArrowLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />{t('pb.back')}</Button>
          <Button onClick={goNext} className="gap-1.5">{t('pb.next')}<ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /></Button>
        </div>
      )}
    </div>
  );
}

export default function PresentationBuilder() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { t, documentLanguage } = useApp();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let proj;
      if (id) proj = await getProject(id);
      if (proj && proj.type === 'presentation') {
        setInitial({ ...proj, content: normalizeContent(proj.content, t) });
      } else {
        setInitial(createNewProject(documentLanguage, t));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !initial) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <Wizard key={initial.id} initial={initial} />;
}