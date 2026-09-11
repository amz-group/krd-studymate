import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Eye, Download, Save, PanelLeft, PanelRight, Maximize, Table as TableIcon,
  Image as ImageIcon, Plus, Minus, Trash2, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/AppContext';
import { saveProject, nowISO } from '@/lib/db';
import { downscaleImage } from '@/lib/editorUtils';
import {
  isRtl, countWords, buildReferencesHtml, buildTocHtml, headingsFromHtml, getPageSize,
} from '@/lib/reportModel';
import { academicSections, fontStack, fontIdFromStack } from '@/lib/reportAssets';
import {
  exec, enableCssStyling, applyFormatBlock, applyFontName, applyFontSize, applyColor,
  applyHighlight, insertImage, insertTable, insertPageBreak, insertToc, insertSection,
  insertReferencesBlock, createLink, getHeadings, updateToc, scrollToHeading,
  findInEditor, replaceInEditor, replaceAllInEditor, getSelectionState,
  tableAddRow, tableDeleteRow, tableAddColumn, tableDeleteColumn, setCellBackground,
  setCellAlign, setTableBorder, setImageWidth, setImageAlign, replaceImage, deleteImage,
} from '@/lib/editorCommands';
import { cn } from '@/lib/utils';
import ReportPage from './ReportPage';
import EditorToolbar from './EditorToolbar';
import DocumentOutline from './DocumentOutline';
import DocumentProperties from './DocumentProperties';
import FindReplaceBar from './FindReplaceBar';
import ReportPreview from './ReportPreview';
import ReportExportDialog from './ReportExportDialog';

const zoomOptions = [
  { id: 'fit', label: 'Fit Width' }, { id: '75', label: '75%' }, { id: '90', label: '90%' },
  { id: '100', label: '100%' }, { id: '110', label: '110%' }, { id: '125', label: '125%' },
];

export default function ReportEditor({ project: initial, onExit }) {
  const { t, dir } = useApp();
  const [project, setProject] = useState(initial);
  const doc = project.content;
  const docDir = isRtl(doc.language) ? 'rtl' : 'ltr';

  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const imageInputRef = useRef(null);
  const replaceImageRef = useRef(null);
  const canvasRef = useRef(null);
  const projectRef = useRef(project);
  projectRef.current = project;

  const [sel, setSel] = useState({});
  const [headings, setHeadings] = useState([]);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });
  const [zoomMode, setZoomMode] = useState('fit');
  const [fitScale, setFitScale] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showProps, setShowProps] = useState(true);
  const [showFind, setShowFind] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [mode, setMode] = useState('edit');
  const [saveState, setSaveState] = useState('idle');
  const saveTimer = useRef(null);
  const stateTimer = useRef(null);

  const ps = getPageSize(doc.pageSize);
  const zoom = zoomMode === 'fit' ? fitScale : Number(zoomMode) / 100;

  // Fit-width scale via container width.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth - 48;
      setFitScale(Math.min(1.5, Math.max(0.5, w / ps.pxW)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ps.pxW, mode]);

  // Recompute outline + word count once the editor has mounted its content.
  useEffect(() => {
    enableCssStyling(editorRef.current);
    const id = setTimeout(() => {
      const ed = editorRef.current;
      if (!ed) return;
      setHeadings(getHeadings(ed).map(({ id, level, text }) => ({ id, level, text })));
      setWordCount(countWords(ed.innerHTML));
    }, 50);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flushHtml = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    setProject((p) => ({ ...p, content: { ...p.content, html } }));
    return html;
  }, []);

  const recompute = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    setHeadings(getHeadings(ed).map(({ id, level, text }) => ({ id, level, text })));
    setWordCount(countWords(ed.innerHTML));
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(async () => {
      const html = editorRef.current?.innerHTML ?? projectRef.current.content.html ?? '';
      const next = { ...projectRef.current, content: { ...projectRef.current.content, html }, updated_date: nowISO() };
      try {
        await saveProject(next);
        setProject(next);
        setSaveState('saved');
      } catch {
        setSaveState('idle');
      }
    }, 800);
  }, []);

  const onInput = useCallback(() => {
    if (stateTimer.current) clearTimeout(stateTimer.current);
    stateTimer.current = setTimeout(recompute, 300);
    scheduleSave();
  }, [recompute, scheduleSave]);

  const onSelectionChange = useCallback(() => {
    const ed = editorRef.current;
    if (!ed || document.activeElement !== ed) return;
    const s = getSelectionState(ed);
    s.fontId = fontIdFromStack(document.queryCommandValue('fontName') || '');
    setSel(s);
  }, []);

  // Save the selection when the editor loses focus (e.g. to a toolbar dropdown)
  // so formatting commands can restore and apply to the right text.
  const onBlur = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSel = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const r = savedRangeRef.current;
    if (r && ed.contains(r.startContainer)) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    }
    ed.focus();
  }, []);

  const updateDoc = useCallback((patch) => {
    setProject((p) => ({ ...p, content: { ...p.content, ...patch } }));
    scheduleSave();
  }, [scheduleSave]);

  // ---- command API for the toolbar ----
  const api = useMemo(() => ({
    undo: () => { editorRef.current?.focus(); exec(editorRef.current, 'undo'); },
    redo: () => { editorRef.current?.focus(); exec(editorRef.current, 'redo'); },
    cmd: (c) => { restoreSel(); exec(editorRef.current, c); },
    formatBlock: (tag) => { restoreSel(); applyFormatBlock(editorRef.current, tag); },
    fontName: (id) => { restoreSel(); applyFontName(editorRef.current, fontStack(id)); },
    fontSize: (px) => { restoreSel(); applyFontSize(editorRef.current, px); },
    color: (c) => { restoreSel(); applyColor(editorRef.current, c); },
    highlight: (c) => { restoreSel(); applyHighlight(editorRef.current, c); },
    image: () => imageInputRef.current?.click(),
    table: () => insertTable(editorRef.current, 3, 3),
    pageBreak: () => insertPageBreak(editorRef.current),
    toc: () => { insertToc(editorRef.current); updateToc(editorRef.current); },
    link: () => { const url = window.prompt(t('rep.linkUrl')); if (url) { restoreSel(); createLink(editorRef.current, url); } },
  }), [t, restoreSel]);

  const onImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await downscaleImage(file);
    insertImage(editorRef.current, src, { width: '70%', align: 'center', caption: '' });
    e.target.value = '';
  };
  const onReplaceImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await downscaleImage(file);
    replaceImage(editorRef.current, src);
    e.target.value = '';
  };

  const insertSec = (idKey) => {
    const s = academicSections.find((x) => x.id === idKey);
    if (s) insertSection(editorRef.current, t(s.key));
  };

  const enterPreview = () => { flushHtml(); setMode('preview'); };
  const exitPreview = () => setMode('edit');

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 's') { e.preventDefault(); flushHtml(); scheduleSave(); }
      if (k === 'f') { e.preventDefault(); setShowFind(true); }
      if (k === 'p') { e.preventDefault(); enterPreview(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flushHtml, scheduleSave]);

  const pages = Math.max(1, Math.ceil(wordCount.words / 350));

  if (mode === 'preview') {
    return <ReportPreview doc={doc} project={project} onExit={exitPreview} onExport={() => setShowExport(true)} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExit} title={t('common.back')}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{project.name}</p>
          <p className="text-[11px] text-muted-foreground">{t(`rep.type.${doc.category}`)} · {doc.language.toUpperCase()}</p>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {saveState === 'saving' ? t('rep.saving') : saveState === 'saved' ? t('rep.saved') : ''}
        </span>
        <select value={zoomMode} onChange={(e) => setZoomMode(e.target.value)} className="h-8 rounded-md border border-input bg-transparent text-xs px-1.5" title={t('rep.zoom')}>
          {zoomOptions.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
        </select>
        <Button variant={focusMode ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setFocusMode((v) => !v)} title={t('rep.focus')}><Maximize className="h-4 w-4" /></Button>
        <Button variant={showOutline ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setShowOutline((v) => !v)} disabled={focusMode} title={t('rep.outline')}><PanelLeft className="h-4 w-4" /></Button>
        <Button variant={showProps ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setShowProps((v) => !v)} disabled={focusMode} title={t('rep.properties')}><PanelRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => { flushHtml(); setShowExport(true); }}><Download className="h-4 w-4" /> <span className="hidden sm:inline">{t('rep.export')}</span></Button>
        <Button variant="default" size="sm" className="h-8 gap-1.5" onClick={enterPreview}><Eye className="h-4 w-4" /> <span className="hidden sm:inline">{t('rep.preview')}</span></Button>
      </div>

      <EditorToolbar t={t} sel={sel} api={api} onFind={() => setShowFind(true)} />

      {/* Contextual table / image tools */}
      {(sel.inTable || sel.inImage) && (
        <div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-border bg-accent/30">
          {sel.inTable && <>
            <span className="text-[11px] text-muted-foreground me-1">{t('rep.table')}:</span>
            <CtxBtn icon={Plus} label={t('rep.table.addRow')} onClick={() => tableAddRow(editorRef.current)} />
            <CtxBtn icon={Minus} label={t('rep.table.delRow')} onClick={() => tableDeleteRow(editorRef.current)} />
            <CtxBtn icon={Plus} label={t('rep.table.addCol')} onClick={() => tableAddColumn(editorRef.current)} />
            <CtxBtn icon={Minus} label={t('rep.table.delCol')} onClick={() => tableDeleteColumn(editorRef.current)} />
            <span className="w-px h-5 bg-border mx-1" />
            <label className="h-7 px-2 rounded-md flex items-center gap-1 text-[11px] cursor-pointer hover:bg-accent" title={t('rep.table.border')}>
              {t('rep.table.border')}
              <input type="color" className="sr-only" onMouseDown={(e) => e.preventDefault()} onChange={(e) => setTableBorder(editorRef.current, e.target.value)} />
            </label>
            <label className="h-7 px-2 rounded-md flex items-center gap-1 text-[11px] cursor-pointer hover:bg-accent" title={t('rep.table.cellBg')}>
              {t('rep.table.cellBg')}
              <input type="color" className="sr-only" onMouseDown={(e) => e.preventDefault()} onChange={(e) => setCellBackground(editorRef.current, e.target.value)} />
            </label>
            <span className="w-px h-5 bg-border mx-1" />
            <CtxBtn icon={AlignLeft} label={t('rep.alignLeft')} onClick={() => setCellAlign(editorRef.current, 'left')} />
            <CtxBtn icon={AlignCenter} label={t('rep.alignCenter')} onClick={() => setCellAlign(editorRef.current, 'center')} />
            <CtxBtn icon={AlignRight} label={t('rep.alignRight')} onClick={() => setCellAlign(editorRef.current, 'right')} />
          </>}
          {sel.inImage && <>
            <span className="text-[11px] text-muted-foreground me-1">{t('rep.image')}:</span>
            {[25, 50, 75, 100].map((p) => (
              <button key={p} onMouseDown={(e) => e.preventDefault()} onClick={() => setImageWidth(editorRef.current, p)} className="h-7 px-2 rounded-md text-[11px] hover:bg-accent">{p}%</button>
            ))}
            <span className="w-px h-5 bg-border mx-1" />
            <CtxBtn icon={AlignLeft} label={t('rep.alignLeft')} onClick={() => setImageAlign(editorRef.current, 'left')} />
            <CtxBtn icon={AlignCenter} label={t('rep.alignCenter')} onClick={() => setImageAlign(editorRef.current, 'center')} />
            <CtxBtn icon={AlignRight} label={t('rep.alignRight')} onClick={() => setImageAlign(editorRef.current, 'right')} />
            <span className="w-px h-5 bg-border mx-1" />
            <Button variant="ghost" size="sm" className="h-7" onClick={() => replaceImageRef.current?.click()}>{t('rep.image.replace')}</Button>
            <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => deleteImage(editorRef.current)}><Trash2 className="h-3.5 w-3.5" /></Button>
            <input ref={replaceImageRef} type="file" accept="image/*" className="hidden" onChange={onReplaceImage} />
          </>}
        </div>
      )}

      {showFind && (
        <FindReplaceBar t={t} onClose={() => setShowFind(false)}
          onFind={(q) => findInEditor(editorRef.current, q)}
          onReplace={(q, r) => replaceInEditor(editorRef.current, q, r)}
          onReplaceAll={(q, r) => { const n = replaceAllInEditor(editorRef.current, q, r); window.alert(t('rep.replacedN').replace('{n}', n)); recompute(); }} />
      )}

      <div className="flex flex-1 min-h-0">
        {!focusMode && showOutline && (
          <div className={cn('w-56 shrink-0 border-e border-border bg-card hidden md:block')}>
            <DocumentOutline t={t} headings={headings} onNavigate={(id) => scrollToHeading(editorRef.current, id)}
              sections={academicSections} onInsertSection={insertSec} />
          </div>
        )}
        <div ref={canvasRef} className="flex-1 min-w-0 overflow-auto bg-[#525659]">
          <ReportPage
            editorRef={editorRef}
            initialHtml={doc.html}
            dir={docDir}
            pageSize={doc.pageSize}
            margin={doc.margin}
            fontFamily={fontStack(doc.fontFamily)}
            fontSize={doc.fontSize}
            lineHeight={doc.lineHeight}
            paragraphSpacing={doc.paragraphSpacing}
            primaryColor={doc.cover.primaryColor}
            zoom={zoom}
            onInput={onInput}
            onSelectionChange={onSelectionChange}
            onBlur={onBlur}
          />
        </div>
        {!focusMode && showProps && (
          <div className={cn('w-72 shrink-0 border-s border-border bg-card hidden md:block')}>
            <DocumentProperties t={t} doc={doc} onChange={updateDoc} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border bg-card text-[11px] text-muted-foreground">
        <span>{wordCount.words.toLocaleString()} {t('rep.words')} · {wordCount.chars.toLocaleString()} {t('rep.chars')} · {pages} {t('rep.pages')}</span>
        <span className="hidden sm:inline">{t('rep.savedHint')}</span>
      </div>

      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={onImageFile} />
      <ReportExportDialog open={showExport} project={project} onClose={() => setShowExport(false)} onFlush={flushHtml} />
    </div>
  );
}

function CtxBtn({ icon: Icon, label, onClick }) {
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={label}>
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}