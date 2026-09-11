import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ScrollText, ListChecks, HelpCircle, Layers, ClipboardCheck, StickyNote,
  BookMarked, Sparkles, BarChart3, Download, ArrowLeft, Focus, X, Menu, Loader2, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/AppContext';
import { useStudyProject } from '@/lib/useStudyProject';
import { getRangeText, rangeLabel } from '@/lib/studyModel';
import { studyGenerator } from '@/lib/studyGenerator';
import StudyDocument from './StudyDocument';
import StudySummary from './StudySummary';
import StudyKeyPoints from './StudyKeyPoints';
import StudyQuestions from './StudyQuestions';
import StudyFlashcards from './StudyFlashcards';
import StudyQuiz from './StudyQuiz';
import StudyNotes from './StudyNotes';
import StudyTerms from './StudyTerms';
import StudyExplain from './StudyExplain';
import StudyProgress from './StudyProgress';
import StudyExportDialog from './StudyExportDialog';

const SECTIONS = [
  { key: 'document', icon: FileText, label: 'study.ws.document' },
  { key: 'summary', icon: ScrollText, label: 'study.ws.summary' },
  { key: 'keyPoints', icon: ListChecks, label: 'study.ws.keyPoints' },
  { key: 'questions', icon: HelpCircle, label: 'study.ws.questions' },
  { key: 'flashcards', icon: Layers, label: 'study.ws.flashcards' },
  { key: 'quiz', icon: ClipboardCheck, label: 'study.ws.quiz' },
  { key: 'notes', icon: StickyNote, label: 'study.ws.notes' },
  { key: 'terms', icon: BookMarked, label: 'study.ws.terms' },
  { key: 'explain', icon: Sparkles, label: 'study.ws.explain' },
  { key: 'progress', icon: BarChart3, label: 'study.ws.progress' },
];

export default function StudyWorkspace({ project: initial, onExit }) {
  const { t, dir } = useApp();
  const navigate = useNavigate();
  const { project, updateContent, saveState } = useStudyProject(initial);
  const c = project.content;

  const [section, setSection] = useState('document');
  const [focus, setFocus] = useState(false);
  const [studyMode, setStudyMode] = useState(null); // 'flashcards'|'quiz'|'questions'
  const [selectedText, setSelectedText] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false); // mobile
  const [rightOpen, setRightOpen] = useState(false); // mobile

  const sourceText = useMemo(() => getRangeText(c), [c]);
  const rLabel = useMemo(() => rangeLabel(c, t), [c, t]);

  const setRange = (patch) => updateContent('range', { ...c.range, ...patch });

  const runGen = (key, fn, ...args) => {
    const result = fn(sourceText, ...args);
    updateContent(key, result);
    return result;
  };

  const addHighlight = (h) => {
    const list = [...(c.highlights || []), { id: Date.now() + '-' + Math.random().toString(36).slice(2, 6), ...h }];
    updateContent('highlights', list);
  };

  const renderSection = () => {
    switch (section) {
      case 'document':
        return <StudyDocument content={c} onAddHighlight={addHighlight} onAddKeyPoint={(txt) => updateContent('keyPoints', [...c.keyPoints, { id: rid(), text: txt }])} onMakeFlashcard={(front, back) => updateContent('flashcards', [...c.flashcards, { id: rid(), front, back, difficulty: null, studied: false }])} onSelectText={setSelectedText} />;
      case 'summary':
        return <StudySummary content={c} sourceText={sourceText} rLabel={rLabel} onGenerate={(type) => runGen('summary', (txt) => ({ type, text: studyGenerator.generateSummary(txt, type), updatedAt: new Date().toISOString(), sourceLabel: rLabel }))} onSave={(text) => updateContent('summary', { ...c.summary, text })} />;
      case 'keyPoints':
        return <StudyKeyPoints content={c} sourceText={sourceText} rLabel={rLabel} onGenerate={() => runGen('keyPoints', (txt) => studyGenerator.generateKeyPoints(txt))} onUpdate={(list) => updateContent('keyPoints', list)} />;
      case 'questions':
        return <StudyQuestions content={c} sourceText={sourceText} rLabel={rLabel} onGenerate={(types) => runGen('questions', (txt) => studyGenerator.generateQuestions(txt, types))} onUpdate={(list) => updateContent('questions', list)} />;
      case 'flashcards':
        return <StudyFlashcards content={c} sourceText={sourceText} rLabel={rLabel} onGenerate={() => runGen('flashcards', (txt) => studyGenerator.generateFlashcards(txt))} onUpdate={(list) => updateContent('flashcards', list)} onProgress={(cardsStudied) => updateContent('progress', { ...c.progress, cardsStudied, lastStudied: new Date().toISOString() })} />;
      case 'quiz':
        return <StudyQuiz content={c} sourceText={sourceText} rLabel={rLabel} onGenerate={(type, length) => runGen('quiz', (txt) => studyGenerator.generateQuiz(txt, type, length))} onResult={(entry) => {
          const hist = [...(c.quizHistory || []), entry];
          const best = Math.max(c.progress.bestScore || 0, entry.percentage);
          updateContent('quizHistory', hist);
          updateContent('progress', { ...c.progress, quizAttempts: (c.progress.quizAttempts || 0) + 1, bestScore: best, lastStudied: new Date().toISOString() });
        }} />;
      case 'notes':
        return <StudyNotes content={c} onUpdate={(notes) => updateContent('notes', notes)} />;
      case 'terms':
        return <StudyTerms content={c} sourceText={sourceText} rLabel={rLabel} onGenerate={() => runGen('terms', (txt) => studyGenerator.extractTerms(txt))} onUpdate={(list) => updateContent('terms', list)} onToFlashcard={(term, expl) => updateContent('flashcards', [...c.flashcards, { id: rid(), front: term, back: expl, difficulty: null, studied: false }])} />;
      case 'explain':
        return <StudyExplain content={c} selectedText={selectedText} onExplain={(text, level) => studyGenerator.explainSimply(text, level)} />;
      case 'progress':
        return <StudyProgress content={c} />;
      default:
        return null;
    }
  };

  const navItem = (s) => {
    const Icon = s.icon;
    const active = section === s.key;
    return (
      <button key={s.key} onClick={() => { setSection(s.key); setLeftOpen(false); }}
        className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'}`}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{t(s.label)}</span>
      </button>
    );
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 md:px-4 h-14 border-b border-border bg-card shrink-0">
        <button className="md:hidden p-2 rounded-lg hover:bg-accent" onClick={() => setLeftOpen(true)}><Menu className="h-5 w-5" /></button>
        <Button variant="ghost" size="sm" className="gap-2 hidden md:inline-flex" onClick={() => navigate('/study-assistant')}>
          <ArrowLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {t('study.common.back')}
        </Button>
        <h1 className="font-semibold truncate flex-1 text-center md:text-start">{project.name}</h1>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {saveState === 'saving' ? <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />{t('study.common.saving')}</span>
            : saveState === 'saved' ? <span className="flex items-center gap-1"><Check className="h-3 w-3" />{t('study.common.saved')}</span>
            : t('study.common.local')}
        </span>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4" /> <span className="hidden sm:inline">{t('study.ws.export')}</span>
        </Button>
      </div>

      {/* Study mode (focus) */}
      {studyMode && (
        <StudyModeOverlay mode={studyMode} content={c} onExit={() => setStudyMode(null)} t={t}
          onFlashcardsUpdate={(list) => updateContent('flashcards', list)}
          onQuizResult={(entry) => { const hist = [...(c.quizHistory || []), entry]; updateContent('quizHistory', hist); updateContent('progress', { ...c.progress, quizAttempts: (c.progress.quizAttempts || 0) + 1, bestScore: Math.max(c.progress.bestScore || 0, entry.percentage), lastStudied: new Date().toISOString() }); }}
          onQuestionsUpdate={(list) => updateContent('questions', list)}
          sourceText={sourceText} rLabel={rLabel} />
      )}

      <div className="flex-1 flex min-h-0">
        {/* Left nav */}
        <aside className={`fixed md:static inset-y-0 ${dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} z-30 w-60 bg-card border-border p-3 overflow-y-auto transition-transform ${leftOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex items-center justify-between mb-3 md:hidden">
            <span className="font-medium text-sm">{t('study.ws.document')}</span>
            <button onClick={() => setLeftOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-1">{SECTIONS.map(navItem)}</div>
          <div className="mt-4 pt-3 border-t border-border space-y-1">
            <button onClick={() => { setStudyMode('flashcards'); }} className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm hover:bg-accent"><Focus className="h-4 w-4" /> {t('study.ws.studyMode')}</button>
          </div>
        </aside>
        {leftOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setLeftOpen(false)} />}

        {/* Center */}
        <main className={`flex-1 min-w-0 overflow-y-auto ${focus ? 'p-0' : 'p-3 md:p-6'}`}>
          {focus ? (
            <FocusView section={section} content={c} sourceText={sourceText} rLabel={rLabel} t={t}
              onExit={() => setFocus(false)}
              onFlashcardsUpdate={(list) => updateContent('flashcards', list)}
              onQuestionsUpdate={(list) => updateContent('questions', list)}
              onQuizResult={(entry) => { const hist = [...(c.quizHistory || []), entry]; updateContent('quizHistory', hist); updateContent('progress', { ...c.progress, quizAttempts: (c.progress.quizAttempts || 0) + 1, bestScore: Math.max(c.progress.bestScore || 0, entry.percentage), lastStudied: new Date().toISOString() }); }}
              onSummarySave={(text) => updateContent('summary', { ...c.summary, text })}
              onNotesUpdate={(notes) => updateContent('notes', notes)} />
          ) : (
            <div className="max-w-4xl mx-auto">{renderSection()}</div>
          )}
        </main>

        {/* Right panel (desktop) */}
        {!focus && (
          <aside className="hidden lg:flex w-72 border-l border-border bg-card p-4 overflow-y-auto flex-col gap-4">
            <RightPanel c={c} t={t} setRange={setRange} setOutLang={(l) => updateContent('outLang', l)} onStudyMode={setStudyMode} onFocus={() => setFocus(true)} onExport={() => setExportOpen(true)} rLabel={rLabel} />
          </aside>
        )}
      </div>

      {/* Right panel (mobile) */}
      {!focus && (
        <>
          <button className="lg:hidden fixed bottom-4 right-4 z-30 rounded-full bg-primary text-primary-foreground h-12 w-12 flex items-center justify-center shadow-lg" onClick={() => setRightOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          {rightOpen && (
            <div className="lg:hidden fixed inset-0 z-40 flex justify-end" onClick={() => setRightOpen(false)}>
              <div className="w-80 max-w-[85%] bg-card border-l border-border p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end mb-2"><button onClick={() => setRightOpen(false)}><X className="h-5 w-5" /></button></div>
                <RightPanel c={c} t={t} setRange={setRange} setOutLang={(l) => updateContent('outLang', l)} onStudyMode={setStudyMode} onFocus={() => setFocus(true)} onExport={() => setExportOpen(true)} rLabel={rLabel} />
              </div>
            </div>
          )}
        </>
      )}

      <StudyExportDialog open={exportOpen} onClose={() => setExportOpen(false)} project={project} t={t} />
    </div>
  );
}

function rid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

function RightPanel({ c, t, setRange, setOutLang, onStudyMode, onFocus, onExport, rLabel }) {
  const page = c.range.page || 0;
  return (
    <>
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('study.ws.range')}</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[['all', 'study.ws.rangeAll'], ['page', 'study.ws.rangePage'], ['pages', 'study.ws.rangePages'], ['text', 'study.ws.rangeText']].map(([m, k]) => (
            <button key={m} onClick={() => setRange({ mode: m, to: m === 'pages' ? c.pages.length : c.range.to })}
              className={`rounded-lg px-2 py-1.5 text-xs border ${c.range.mode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>{t(k)}</button>
          ))}
        </div>
        {c.range.mode === 'pages' && (
          <div className="flex items-center gap-2 mt-2">
            <Input type="number" min={1} max={c.pages.length} value={c.range.from} onChange={(e) => setRange({ from: Number(e.target.value) })} className="h-8 text-sm" />
            <span className="text-xs text-muted-foreground">–</span>
            <Input type="number" min={1} max={c.pages.length} value={c.range.to} onChange={(e) => setRange({ to: Number(e.target.value) })} className="h-8 text-sm" />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">{t('study.ws.rangeLabel', { label: rLabel })}</p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('study.ws.outLang')}</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[['same', 'study.ws.langSame'], ['en', 'lang.en'], ['ku', 'lang.ku'], ['ar', 'lang.ar']].map(([v, k]) => (
            <button key={v} onClick={() => setOutLang(v)} className={`rounded-lg px-2 py-1.5 text-xs border ${c.outLang === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>{t(k)}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('study.ws.studyMode')}</h3>
        {['flashcards', 'quiz', 'questions'].map((m) => (
          <Button key={m} variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => onStudyMode(m)}>
            <Focus className="h-4 w-4" /> {t(`study.ws.${m}`)}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={onFocus}>
          <Focus className="h-4 w-4" /> {t('study.ws.focusMode')}
        </Button>
      </div>

      <Button className="w-full gap-2" onClick={onExport}><Download className="h-4 w-4" /> {t('study.ws.export')}</Button>
    </>
  );
}

// Distraction-free study mode overlay
function StudyModeOverlay({ mode, content, onExit, t, onFlashcardsUpdate, onQuizResult, onQuestionsUpdate, sourceText, rLabel }) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border">
        <h2 className="font-semibold">{t(`study.ws.${mode}`)}</h2>
        <Button variant="ghost" size="sm" className="gap-2" onClick={onExit}><X className="h-4 w-4" /> {t('study.ws.backToWorkspace')}</Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {mode === 'flashcards' && <StudyFlashcards content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onUpdate={onFlashcardsUpdate} onProgress={() => {}} focus />}
          {mode === 'quiz' && <StudyQuiz content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onResult={onQuizResult} focus />}
          {mode === 'questions' && <StudyQuestions content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onUpdate={onQuestionsUpdate} focus />}
        </div>
      </div>
    </div>
  );
}

// Focus mode for the active section
function FocusView({ section, content, sourceText, rLabel, t, onExit, onFlashcardsUpdate, onQuestionsUpdate, onQuizResult, onSummarySave, onNotesUpdate }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border bg-card">
        <h2 className="font-semibold">{t(`study.ws.${section}`)}</h2>
        <Button variant="ghost" size="sm" className="gap-2" onClick={onExit}><X className="h-4 w-4" /> {t('study.ws.exitFocus')}</Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {section === 'summary' && <StudySummary content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onSave={onSummarySave} focus />}
          {section === 'flashcards' && <StudyFlashcards content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onUpdate={onFlashcardsUpdate} onProgress={() => {}} focus />}
          {section === 'quiz' && <StudyQuiz content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onResult={onQuizResult} focus />}
          {section === 'questions' && <StudyQuestions content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onUpdate={onQuestionsUpdate} focus />}
          {section === 'notes' && <StudyNotes content={content} onUpdate={onNotesUpdate} focus />}
          {section === 'keyPoints' && <StudyKeyPoints content={content} sourceText={sourceText} rLabel={rLabel} onGenerate={() => {}} onUpdate={() => {}} focus />}
          {section === 'document' && <StudyDocument content={content} onAddHighlight={() => {}} onAddKeyPoint={() => {}} onMakeFlashcard={() => {}} onSelectText={() => {}} />}
        </div>
      </div>
    </div>
  );
}